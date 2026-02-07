import { useRef, useState, useCallback, useEffect } from 'react';
import { useNetworkStore, useVisualizationStore, useSimulationStore } from '../store';
import type { ElementType, Coordinates, Junction, Reservoir, Tank, Pipe } from '../types';
import { ContextMenu, useContextMenu } from './ContextMenu';

interface NetworkCanvasProps {
  selectedTool: ElementType | 'select';
  onElementSelect: (id: string | null) => void;
  selectedElementId: string | null;
}

export function NetworkCanvas({
  selectedTool,
  onElementSelect,
  selectedElementId,
}: NetworkCanvasProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<Coordinates | null>(null);
  const [dragOffset, setDragOffset] = useState<Coordinates | null>(null);
  const [tempElement, setTempElement] = useState<{ start: Coordinates; end: Coordinates } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [linkStartNode, setLinkStartNode] = useState<string | null>(null);
  
  // حالة رسم الأنابيب الجديدة
  const [isDrawingPipe, setIsDrawingPipe] = useState(false);
  const [pipeNodes, setPipeNodes] = useState<string[]>([]);
  const [tempLineEnd, setTempLineEnd] = useState<Coordinates | null>(null);
  const [bendType, setBendType] = useState<'angle' | 'arc' | null>(null);
  const [showBendMenu, setShowBendMenu] = useState(false);
  const [bendMenuPosition, setBendMenuPosition] = useState({ x: 0, y: 0 });
  const [arcControlPoint, setArcControlPoint] = useState<Coordinates | null>(null);
  const [angleDirection, setAngleDirection] = useState<'auto' | 'horizontal-first' | 'vertical-first'>('auto');
  
  // القائمة السياقية
  const { isOpen: isContextMenuOpen, position: contextMenuPosition, items: contextMenuItems, openContextMenu, closeContextMenu } = useContextMenu();

  const {
    junctions,
    reservoirs,
    tanks,
    pipes,
    pumps,
    valves,
    selectedIds,
    viewBox,
    zoom,
    showGrid,
    snapToGrid,
    addElement,
    updateElement,
    selectElement,
    panView,
    setZoom,
    deleteElement,
    fitView,
  } = useNetworkStore();

  const {
    showFlowDirection,
    flowArrowSize,
    flowArrowSpacing,
    showPressureColors,
    showVelocityColors,
    showNodeLabels,
    showPipeLabels,
    showPressureLabels,
    showFlowLabels,
    showVelocityLabels,
    labelFontSize,
    showLegend,
    showScaleBar,
    showBackgroundMap,
    backgroundMapType,
    getPressureColor,
    getVelocityColor,
  } = useVisualizationStore();

  const { results, currentTime } = useSimulationStore();

  // تحويل الإحداثيات من الشاشة إلى Canvas
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number): Coordinates => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = viewBox.width / rect.width;
      const scaleY = viewBox.height / rect.height;
      return {
        x: viewBox.x + (screenX - rect.left) * scaleX,
        y: viewBox.y + (screenY - rect.top) * scaleY,
      };
    },
    [viewBox]
  );

  // التصاق بالشبكة
  const snapToGridPoint = useCallback(
    (point: Coordinates): Coordinates => {
      if (!snapToGrid) return point;
      return {
        x: Math.round(point.x / 10) * 10,
        y: Math.round(point.y / 10) * 10,
      };
    },
    [snapToGrid]
  );

  // العثور على أقرب عقدة
  const findNearestNode = useCallback(
    (point: Coordinates, maxDistance: number = 25): Junction | Reservoir | Tank | null => {
      const allNodes = [
        ...Array.from(junctions.values()),
        ...Array.from(reservoirs.values()),
        ...Array.from(tanks.values()),
      ];

      let nearest: Junction | Reservoir | Tank | null = null;
      let minDist = Infinity;

      allNodes.forEach((node) => {
        const dist = Math.hypot(
          node.coordinates.x - point.x,
          node.coordinates.y - point.y
        );
        if (dist < minDist && dist < maxDistance) {
          minDist = dist;
          nearest = node;
        }
      });

      return nearest;
    },
    [junctions, reservoirs, tanks]
  );

  // معالجة النقر
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const coords = screenToCanvas(e.clientX, e.clientY);
    const snapped = snapToGridPoint(coords);
    const nearestNode = findNearestNode(snapped, 25);

    // وضع رسم الأنابيب المتقدم
    if (isDrawingPipe && ['pipe', 'pump', 'valve'].includes(selectedTool)) {
      if (e.button === 0) {
        // إذا كان هناك انعطاف معلق، نؤكده
        if (bendType) {
          confirmBend();
          return;
        }
        
        // الزر الأيسر: إضافة عقدة وسيطة أو الربط بعقدة موجودة
        let targetNodeId: string | null = null;
        
        if (nearestNode) {
          // إذا كانت الفأرة على عقدة موجودة، اربط عليها
          targetNodeId = nearestNode.id;
        } else {
          // إنشاء عقدة جديدة في موقع الفأرة
          targetNodeId = addElement('junction', { coordinates: snapped });
        }
        
        if (pipeNodes.length > 0 && targetNodeId) {
          // ربط العقدة السابقة بالهدف
          const prevNodeId = pipeNodes[pipeNodes.length - 1];
          if (prevNodeId !== targetNodeId) {
            addElement(selectedTool as ElementType, {
              node1: prevNodeId,
              node2: targetNodeId,
            });
            setPipeNodes([...pipeNodes, targetNodeId]);
            setTempLineEnd(snapped);
          }
        }
        return;
      } else if (e.button === 2) {
        // الزر الأيمن: إظهار قائمة الانعطافات
        e.stopPropagation();
        setBendMenuPosition({ x: e.clientX, y: e.clientY });
        setShowBendMenu(true);
        return;
      }
    }

    // التحريك بالزر الأوسط أو Shift+سحب
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // وضع الاختيار
    if (selectedTool === 'select') {
      if (nearestNode) {
        setIsDragging(true);
        setDragOffset({
          x: snapped.x - nearestNode.coordinates.x,
          y: snapped.y - nearestNode.coordinates.y,
        });
        if (!e.ctrlKey) {
          selectElement(nearestNode.id, false);
        } else {
          selectElement(nearestNode.id, true);
        }
        onElementSelect(nearestNode.id);
      } else {
        setDragStart(snapped);
      }
    } else if (['junction', 'reservoir', 'tank'].includes(selectedTool)) {
      const id = addElement(selectedTool as ElementType, { coordinates: snapped });
      onElementSelect(id);
    } else if (['pipe', 'pump', 'valve'].includes(selectedTool)) {
      // بدء وضع رسم الأنابيب الجديد
      if (nearestNode) {
        setIsDrawingPipe(true);
        setPipeNodes([nearestNode.id]);
        setTempLineEnd(nearestNode.coordinates);
        setLinkStartNode(nearestNode.id);
        setBendType(null); // إعادة تعيين نوع الانعطاف
      }
    }
  };

  // إضافة انعطاف (زاوية أو قوس)
  const addBend = (type: 'angle' | 'arc') => {
    if (!isDrawingPipe || pipeNodes.length === 0 || !tempLineEnd) return;
    
    setShowBendMenu(false);
    setBendType(type);
    
    const prevNodeId = pipeNodes[pipeNodes.length - 1];
    const prevNode = junctions.get(prevNodeId) || reservoirs.get(prevNodeId) || tanks.get(prevNodeId);
    
    if (!prevNode) return;
    
    if (type === 'arc') {
      // تهيئة نقطة التحكم للقوس في المنتصف
      const midX = (prevNode.coordinates.x + tempLineEnd.x) / 2;
      const midY = (prevNode.coordinates.y + tempLineEnd.y) / 2;
      setArcControlPoint({ x: midX, y: midY });
    } else if (type === 'angle') {
      // تحديد اتجاه الزاوية تلقائياً بناءً على موقع الفأرة
      const dx = Math.abs(tempLineEnd.x - prevNode.coordinates.x);
      const dy = Math.abs(tempLineEnd.y - prevNode.coordinates.y);
      
      if (dx > dy) {
        setAngleDirection('horizontal-first');
      } else {
        setAngleDirection('vertical-first');
      }
    }
  };
  
  // تأكيد الانعطاف وإنشاء العقد
  const confirmBend = () => {
    if (!isDrawingPipe || pipeNodes.length === 0 || !tempLineEnd) return;
    
    const prevNodeId = pipeNodes[pipeNodes.length - 1];
    const prevNode = junctions.get(prevNodeId) || reservoirs.get(prevNodeId) || tanks.get(prevNodeId);
    
    if (!prevNode) return;
    
    let newNodes: string[] = [];
    
    if (bendType === 'angle') {
      // إنشاء زاوية قائمة
      let cornerX: number, cornerY: number;
      
      if (angleDirection === 'horizontal-first') {
        // أفقي أولاً ثم رأسي
        cornerX = tempLineEnd.x;
        cornerY = prevNode.coordinates.y;
      } else {
        // رأسي أولاً ثم أفقي
        cornerX = prevNode.coordinates.x;
        cornerY = tempLineEnd.y;
      }
      
      // إنشاء عقدة الزاوية
      const cornerNodeId = addElement('junction', { 
        coordinates: { x: cornerX, y: cornerY } 
      });
      
      // ربط العقدة السابقة بالزاوية
      addElement(selectedTool as ElementType, {
        node1: prevNodeId,
        node2: cornerNodeId,
      });
      
      // إنشاء عقدة الوجهة النهائية
      const endNodeId = addElement('junction', { 
        coordinates: tempLineEnd 
      });
      
      // ربط الزاوية بالوجهة
      addElement(selectedTool as ElementType, {
        node1: cornerNodeId,
        node2: endNodeId,
      });
      
      newNodes = [cornerNodeId, endNodeId];
      
    } else if (bendType === 'arc' && arcControlPoint) {
      // إنشاء قوس باستخدام نقطة التحكم
      const endNodeId = addElement('junction', { 
        coordinates: tempLineEnd 
      });
      
      // إنشاء عقدة وسيطة عند نقطة التحكم (للحفاظ على شكل القوس)
      const midNodeId = addElement('junction', {
        coordinates: arcControlPoint
      });
      
      // ربط العقدة السابقة بنقطة التحكم
      addElement(selectedTool as ElementType, {
        node1: prevNodeId,
        node2: midNodeId,
      });
      
      // ربط نقطة التحكم بالوجهة
      addElement(selectedTool as ElementType, {
        node1: midNodeId,
        node2: endNodeId,
      });
      
      newNodes = [midNodeId, endNodeId];
    }
    
    // تحديث القائمة
    setPipeNodes([...pipeNodes, ...newNodes]);
    
    // إعادة تعيين حالة الانعطاف
    setBendType(null);
    setArcControlPoint(null);
    setAngleDirection('auto');
  };

  // معالجة النقر بالزر الأيمن (القائمة السياقية)
  const handleContextMenu = (e: React.MouseEvent) => {
    // إذا كنا في وضع رسم الأنابيب، لا نعرض القائمة السياقية العادية
    // بل نترك قائمة الانعطافات تظهر فقط
    if (isDrawingPipe && ['pipe', 'pump', 'valve'].includes(selectedTool)) {
      return;
    }
    
    const coords = screenToCanvas(e.clientX, e.clientY);
    const snapped = snapToGridPoint(coords);
    const clickedElement = findNearestNode(snapped, 25);
    
    if (clickedElement) {
      // قائمة للعنصر المحدد
      openContextMenu(e, [
        {
          label: 'تحديد',
          action: () => {
            selectElement(clickedElement.id, false);
            onElementSelect(clickedElement.id);
          },
          icon: '👆',
        },
        {
          label: 'حذف',
          action: () => {
            deleteElement(clickedElement.id);
            onElementSelect(null);
          },
          icon: '🗑️',
        },
        { separator: true },
        {
          label: 'نسخ الخصائص',
          action: () => {
            // TODO: نسخ الخصائص
            console.log('Copy properties:', clickedElement);
          },
          icon: '📋',
        },
        {
          label: 'تكبير على العنصر',
          action: () => {
            // TODO: تكبير على العنصر
            console.log('Zoom to element:', clickedElement);
          },
          icon: '🔍',
        },
      ]);
    } else {
      // قائمة للوحة الفارغة
      openContextMenu(e, [
        {
          label: 'إضافة عقدة',
          action: () => {
            const id = addElement('junction', { coordinates: snapped });
            onElementSelect(id);
          },
          icon: '●',
        },
        {
          label: 'إضافة خزان رئيسي',
          action: () => {
            const id = addElement('reservoir', { coordinates: snapped });
            onElementSelect(id);
          },
          icon: '▼',
        },
        {
          label: 'إضافة خزان',
          action: () => {
            const id = addElement('tank', { coordinates: snapped });
            onElementSelect(id);
          },
          icon: '▭',
        },
        { separator: true },
        {
          label: 'تكبير',
          action: () => setZoom(zoom * 1.2),
          icon: '➕',
        },
        {
          label: 'تصغير',
          action: () => setZoom(zoom * 0.8),
          icon: '➖',
        },
        {
          label: 'تكيف العرض',
          action: () => fitView(),
          icon: '⊡',
        },
        { separator: true },
        {
          label: 'تراجع',
          action: () => undo(),
          icon: '↩️',
          disabled: !canUndo(),
        },
        {
          label: 'إعادة',
          action: () => redo(),
          icon: '↪️',
          disabled: !canRedo(),
        },
      ]);
    }
  };

  // معالجة حركة الماوس
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = screenToCanvas(e.clientX, e.clientY);
    const snapped = snapToGridPoint(coords);

    // تحديث العقدة المعلقة
    const nearest = findNearestNode(snapped, 30);
    setHoveredNode(nearest?.id || null);

    // تحديث خط الأنبوب المتقطع أثناء الرسم
    if (isDrawingPipe && pipeNodes.length > 0) {
      setTempLineEnd(snapped);
      
      // تحديث نقطة التحكم للقوس بناءً على حركة الماوس
      if (bendType === 'arc') {
        const lastNodeId = pipeNodes[pipeNodes.length - 1];
        const lastNode = junctions.get(lastNodeId) || reservoirs.get(lastNodeId) || tanks.get(lastNodeId);
        
        if (lastNode) {
          // حساب نقطة التحكم بناءً على موقع الماوس
          // نقطة التحكم تتحرك بشكل حر لسماح المستخدم بتحديد انحناء القوس
          const dx = snapped.x - lastNode.coordinates.x;
          const dy = snapped.y - lastNode.coordinates.y;
          
          // نقطة التحكم تكون في منتصف المسافة تقريباً لكنها تتأثر بحركة الماوس
          const controlX = lastNode.coordinates.x + dx * 0.5;
          const controlY = lastNode.coordinates.y + dy * 0.3; // نسبة أقل للانحناء
          
          setArcControlPoint({ x: controlX, y: controlY });
        }
      } else if (bendType === 'angle') {
        // تحديث اتجاه الزاوية تلقائياً
        const lastNodeId = pipeNodes[pipeNodes.length - 1];
        const lastNode = junctions.get(lastNodeId) || reservoirs.get(lastNodeId) || tanks.get(lastNodeId);
        
        if (lastNode) {
          const dx = Math.abs(snapped.x - lastNode.coordinates.x);
          const dy = Math.abs(snapped.y - lastNode.coordinates.y);
          
          if (dx > dy) {
            setAngleDirection('horizontal-first');
          } else {
            setAngleDirection('vertical-first');
          }
        }
      }
      
      return;
    }

    if (isPanning && dragStart) {
      const dx = dragStart.x - e.clientX;
      const dy = dragStart.y - e.clientY;
      panView(dx, dy);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && dragOffset && selectedElementId) {
      const newX = snapped.x - dragOffset.x;
      const newY = snapped.y - dragOffset.y;
      updateElement(selectedElementId, {
        coordinates: { x: newX, y: newY },
      });
      return;
    }

    if (tempElement && dragStart) {
      if (linkStartNode) {
        const nearestEnd = findNearestNode(snapped, 30);
        if (nearestEnd && nearestEnd.id !== linkStartNode) {
          setTempElement({
            start: tempElement.start,
            end: nearestEnd.coordinates,
          });
        } else {
          setTempElement({ start: tempElement.start, end: snapped });
        }
      } else {
        setTempElement({ start: dragStart, end: snapped });
      }
    }
  };

  // معالجة رفع الماوس
  const handleMouseUp = () => {
    if (tempElement && dragStart) {
      let startNode = linkStartNode;
      let endNode: string | null = null;

      // البحث عن العقد
      const allNodes = [
        ...Array.from(junctions.values()),
        ...Array.from(reservoirs.values()),
        ...Array.from(tanks.values()),
      ];

      if (!startNode) {
        const startNearest = allNodes.find(
          (n) => Math.hypot(n.coordinates.x - tempElement.start.x, n.coordinates.y - tempElement.start.y) < 25
        );
        if (startNearest) startNode = startNearest.id;
      }

      const endNearest = allNodes.find(
        (n) => Math.hypot(n.coordinates.x - tempElement.end.x, n.coordinates.y - tempElement.end.y) < 25
      );
      if (endNearest && endNearest.id !== startNode) {
        endNode = endNearest.id;
      }

      if (startNode && endNode) {
        const id = addElement(selectedTool as ElementType, {
          node1: startNode,
          node2: endNode,
        });
        onElementSelect(id);
      }
    }

    setIsDragging(false);
    setIsPanning(false);
    setDragStart(null);
    setDragOffset(null);
    setTempElement(null);
    setLinkStartNode(null);
  };

  // إلغاء وضع رسم الأنابيب
  const cancelPipeDrawing = () => {
    setIsDrawingPipe(false);
    setPipeNodes([]);
    setTempLineEnd(null);
    setLinkStartNode(null);
    setBendType(null);
    setShowBendMenu(false);
    setArcControlPoint(null);
    setAngleDirection('auto');
  };

  // معالجة عجلة الفأرة (تكبير/تصغير نحو موقع الفأرة)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    // الحصول على موقع الفأرة بالنسبة للـ SVG
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // تحويل موقع الفأرة إلى إحداثيات Canvas
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    const canvasX = viewBox.x + mouseX * scaleX;
    const canvasY = viewBox.y + mouseY * scaleY;
    
    // حساب معامل التكبير/التصغير
    const zoomIntensity = 0.1;
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = 1 + (direction * zoomIntensity);
    
    // حساب مستوى التكبير الجديد
    const newZoom = Math.max(0.1, Math.min(5, zoom * factor));
    
    // حساب العرض والارتفاع الجديدين
    const newWidth = viewBox.width * (zoom / newZoom);
    const newHeight = viewBox.height * (zoom / newZoom);
    
    // حساب الإحداثيات الجديدة للتكبير نحو موقع الفأرة
    const newX = canvasX - (canvasX - viewBox.x) * (newWidth / viewBox.width);
    const newY = canvasY - (canvasY - viewBox.y) * (newHeight / viewBox.height);
    
    // تحديث viewBox
    panView(viewBox.x - newX, viewBox.y - newY);
    setZoom(newZoom);
  };

  // معالجة لوحة المفاتيح
  const { undo, redo, canUndo, canRedo } = useNetworkStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // إلغاء رسم الأنبوب بالضغط على Escape
      if (e.key === 'Escape' && isDrawingPipe) {
        cancelPipeDrawing();
        return;
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach((id) => deleteElement(id));
        onElementSelect(null);
      }
      
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      
      // Redo: Ctrl+Y أو Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, deleteElement, onElementSelect, undo, redo, canUndo, canRedo, isDrawingPipe]);

  // الحصول على نتائج العقدة في الوقت الحالي
  const getNodeResult = (nodeId: string) => {
    if (!results) return null;
    return results.nodeResults.get(nodeId);
  };

  // الحصول على نتائج الرابط في الوقت الحالي
  const getLinkResult = (linkId: string) => {
    if (!results) return null;
    return results.linkResults.get(linkId);
  };

  // رسم أسهم التدفق
  const renderFlowArrows = (
    pipe: Pipe,
    node1: Junction | Reservoir | Tank,
    node2: Junction | Reservoir | Tank
  ) => {
    if (!showFlowDirection || !results) return null;

    const linkResult = getLinkResult(pipe.id);
    if (!linkResult || !linkResult.flow) return null;

    const flow = linkResult.flow[currentTime] || 0;
    if (Math.abs(flow) < 0.001) return null;

    const dx = node2.coordinates.x - node1.coordinates.x;
    const dy = node2.coordinates.y - node1.coordinates.y;
    const length = Math.hypot(dx, dy);
    const angle = calculateAngle(node1.coordinates.x, node1.coordinates.y, node2.coordinates.x, node2.coordinates.y);
    
    const effectiveAngle = flow > 0 ? angle : angle + 180;
    
    const arrows = [];
    const numArrows = Math.max(1, Math.floor(length / flowArrowSpacing));
    
    for (let i = 1; i < numArrows; i++) {
      const t = i / numArrows;
      const x = node1.coordinates.x + dx * t;
      const y = node1.coordinates.y + dy * t;
      
      arrows.push(
        <g
          key={`arrow-${pipe.id}-${i}`}
          transform={`translate(${x}, ${y}) rotate(${effectiveAngle})`}
        >
          <polygon
            points={`0,-${flowArrowSize/2} ${flowArrowSize},0 0,${flowArrowSize/2}`}
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1"
          />
        </g>
      );
    }
    
    return arrows;
  };

  // رسم الملصقات
  const renderLabels = () => {
    const labels: React.ReactElement[] = [];

    junctions.forEach((junction) => {
      const x = junction.coordinates.x;
      const y = junction.coordinates.y;

      if (showNodeLabels) {
        labels.push(
          <text
            key={`label-${junction.id}`}
            x={x}
            y={y - 15}
            textAnchor="middle"
            fontSize={labelFontSize}
            fill="#374151"
            fontWeight="500"
            className="pointer-events-none"
          >
            {junction.id}
          </text>
        );
      }

      if (showPressureLabels && results) {
        const nodeResult = getNodeResult(junction.id);
        if (nodeResult && nodeResult.pressure) {
          const pressure = nodeResult.pressure[currentTime]?.toFixed(1) || '0';
          labels.push(
            <text
              key={`pressure-${junction.id}`}
              x={x}
              y={y + 20}
              textAnchor="middle"
              fontSize={labelFontSize - 1}
              fill="#dc2626"
              className="pointer-events-none"
            >
              {pressure} m
            </text>
          );
        }
      }
    });

    pipes.forEach((pipe) => {
      const node1 = junctions.get(pipe.node1) || reservoirs.get(pipe.node1) || tanks.get(pipe.node1);
      const node2 = junctions.get(pipe.node2) || reservoirs.get(pipe.node2) || tanks.get(pipe.node2);
      if (!node1 || !node2) return;

      const midX = (node1.coordinates.x + node2.coordinates.x) / 2;
      const midY = (node1.coordinates.y + node2.coordinates.y) / 2;

      if (showPipeLabels) {
        labels.push(
          <text
            key={`label-${pipe.id}`}
            x={midX}
            y={midY - 10}
            textAnchor="middle"
            fontSize={labelFontSize}
            fill="#374151"
            className="pointer-events-none"
          >
            {pipe.id}
          </text>
        );
      }

      if (showFlowLabels && results) {
        const linkResult = getLinkResult(pipe.id);
        if (linkResult && linkResult.flow) {
          const flow = Math.abs(linkResult.flow[currentTime] || 0).toFixed(2);
          labels.push(
            <text
              key={`flow-${pipe.id}`}
              x={midX}
              y={midY + 5}
              textAnchor="middle"
              fontSize={labelFontSize - 1}
              fill="#059669"
              className="pointer-events-none"
            >
              {flow} L/s
            </text>
          );
        }
      }

      if (showVelocityLabels && results) {
        const linkResult = getLinkResult(pipe.id);
        if (linkResult && linkResult.velocity) {
          const velocity = Math.abs(linkResult.velocity[currentTime] || 0).toFixed(2);
          labels.push(
            <text
              key={`velocity-${pipe.id}`}
              x={midX}
              y={midY + 18}
              textAnchor="middle"
              fontSize={labelFontSize - 1}
              fill="#7c3aed"
              className="pointer-events-none"
            >
              {velocity} m/s
            </text>
          );
        }
      }
    });

    return labels;
  };

  // رسم خطوط الأنابيب المتقطعة أثناء الرسم
  const renderDrawingLines = () => {
    if (!isDrawingPipe || pipeNodes.length === 0 || !tempLineEnd) return null;

    const elements: React.ReactElement[] = [];
    
    // رسم الخط من آخر عقدة إلى موقع المؤشر (مع الانعطاف إذا كان محدداً)
    const lastNodeId = pipeNodes[pipeNodes.length - 1];
    const lastNode = junctions.get(lastNodeId) || reservoirs.get(lastNodeId) || tanks.get(lastNodeId);
    
    if (lastNode) {
      if (bendType === 'angle') {
        // رسم زاوية قائمة (خط أفقي ثم رأسي)
        let cornerX: number, cornerY: number;
        
        if (angleDirection === 'horizontal-first') {
          // أفقي أولاً ثم رأسي
          cornerX = tempLineEnd.x;
          cornerY = lastNode.coordinates.y;
        } else {
          // رأسي أولاً ثم أفقي
          cornerX = lastNode.coordinates.x;
          cornerY = tempLineEnd.y;
        }
        
        // الخط الأول
        elements.push(
          <line
            key="temp-line-1"
            x1={lastNode.coordinates.x}
            y1={lastNode.coordinates.y}
            x2={cornerX}
            y2={cornerY}
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="8 4"
            opacity="0.9"
          />
        );
        
        // الخط الثاني
        elements.push(
          <line
            key="temp-line-2"
            x1={cornerX}
            y1={cornerY}
            x2={tempLineEnd.x}
            y2={tempLineEnd.y}
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="8 4"
            opacity="0.9"
          />
        );
        
        // رمز الزاوية القائمة
        elements.push(
          <g key="angle-marker">
            <rect
              x={cornerX - 5}
              y={cornerY - 5}
              width="10"
              height="10"
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth="2"
            />
            <text x={cornerX} y={cornerY - 10} textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">
              90°
            </text>
          </g>
        );
        
        // تعليم توضيحي
        elements.push(
          <text
            key="angle-hint"
            x={(lastNode.coordinates.x + tempLineEnd.x) / 2}
            y={(lastNode.coordinates.y + tempLineEnd.y) / 2 - 20}
            textAnchor="middle"
            fontSize="11"
            fill="#3b82f6"
            fontWeight="bold"
          >
            زاوية قائمة - اضغط زر أيسر للتأكيد
          </text>
        );
        
      } else if (bendType === 'arc') {
        // رسم قوس باستخدام منحنى بيزيه تربيعي مع نقطة تحكم قابلة للتعديل
        const controlX = arcControlPoint?.x ?? (lastNode.coordinates.x + tempLineEnd.x) / 2;
        const controlY = arcControlPoint?.y ?? (lastNode.coordinates.y + tempLineEnd.y) / 2;
        
        // رسم خطوط التحكم (خفيفة)
        elements.push(
          <line
            key="control-line-1"
            x1={lastNode.coordinates.x}
            y1={lastNode.coordinates.y}
            x2={controlX}
            y2={controlY}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        );
        elements.push(
          <line
            key="control-line-2"
            x1={controlX}
            y1={controlY}
            x2={tempLineEnd.x}
            y2={tempLineEnd.y}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        );
        
        // رسم القوس الرئيسي
        elements.push(
          <path
            key="temp-arc"
            d={`M ${lastNode.coordinates.x} ${lastNode.coordinates.y} 
                Q ${controlX} ${controlY} ${tempLineEnd.x} ${tempLineEnd.y}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="8 4"
            opacity="0.9"
          />
        );
        
        // نقطة التحكم (يمكن سحبها)
        elements.push(
          <g key="control-point">
            <circle
              cx={controlX}
              cy={controlY}
              r="6"
              fill="#ec4899"
              stroke="#fff"
              strokeWidth="2"
              className="cursor-move"
            />
            <text x={controlX} y={controlY - 12} textAnchor="middle" fontSize="9" fill="#ec4899">
              اسحب لضبط القوس
            </text>
          </g>
        );
        
        // تعليم توضيحي
        elements.push(
          <text
            key="arc-hint"
            x={(lastNode.coordinates.x + tempLineEnd.x) / 2}
            y={Math.min(lastNode.coordinates.y, tempLineEnd.y) - 30}
            textAnchor="middle"
            fontSize="11"
            fill="#3b82f6"
            fontWeight="bold"
          >
            حرك الماوس لضبط انحناء القوس - اضغط زر أيسر للتأكيد
          </text>
        );
      } else {
        // خط مستقيم عادي
        elements.push(
          <line
            key="temp-line"
            x1={lastNode.coordinates.x}
            y1={lastNode.coordinates.y}
            x2={tempLineEnd.x}
            y2={tempLineEnd.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.8"
          />
        );
      }
    }

    // رسم خطوط الأنابيب المكتملة (العقد الوسيطة)
    for (let i = 0; i < pipeNodes.length - 1; i++) {
      const node1 = junctions.get(pipeNodes[i]) || reservoirs.get(pipeNodes[i]) || tanks.get(pipeNodes[i]);
      const node2 = junctions.get(pipeNodes[i + 1]) || reservoirs.get(pipeNodes[i + 1]) || tanks.get(pipeNodes[i + 1]);
      
      if (node1 && node2) {
        elements.push(
          <line
            key={`drawn-line-${i}`}
            x1={node1.coordinates.x}
            y1={node1.coordinates.y}
            x2={node2.coordinates.x}
            y2={node2.coordinates.y}
            stroke="#10b981"
            strokeWidth="3"
            opacity="0.7"
          />
        );
      }
    }

    return elements;
  };

  // رسم مقياس الرسم
  const renderScaleBar = () => {
    if (!showScaleBar) return null;

    const scaleBarLength = 100 / zoom;
    const x = viewBox.x + 20;
    const y = viewBox.y + viewBox.height - 40;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width={scaleBarLength} height="6" fill="white" stroke="#374151" strokeWidth="1" />
        <rect x="0" y="0" width={scaleBarLength / 2} height="6" fill="#374151" />
        <rect x={scaleBarLength / 2} y="0" width={scaleBarLength / 2} height="6" fill="white" />
        <text x="0" y="-5" fontSize="10" fill="#374151">0</text>
        <text x={scaleBarLength} y="-5" fontSize="10" fill="#374151" textAnchor="end">100 m</text>
      </g>
    );
  };

  // رسم وسيلة الإيضاح
  const renderLegend = () => {
    if (!showLegend) return null;

    const x = viewBox.x + viewBox.width - 150;
    const y = viewBox.y + 20;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width="130" height="140" fill="white" stroke="#d1d5db" strokeWidth="1" rx="4" opacity="0.95" />
        <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#111827">الرموز</text>
        
        <circle cx="20" cy="40" r="5" fill="white" stroke="#0066CC" strokeWidth="2" />
        <text x="35" y="44" fontSize="10" fill="#374151">عقدة</text>
        
        <path d="M12,60 L4,75 L20,75 Z" fill="#E6FAF0" stroke="#00AA44" strokeWidth="1.5" />
        <text x="35" y="72" fontSize="10" fill="#374151">خزان رئيسي</text>
        
        <rect x="12" y="85" width="16" height="20" fill="#E6F7FF" stroke="#0099CC" strokeWidth="1.5" rx="2" />
        <text x="35" y="100" fontSize="10" fill="#374151">خزان</text>
        
        <circle cx="20" cy="125" r="6" fill="#FFF0E6" stroke="#FF6600" strokeWidth="1.5" />
        <text x="35" y="129" fontSize="10" fill="#374151">مضخة</text>
      </g>
    );
  };

  // رسم الشبكة
  const renderGrid = () => {
    if (!showGrid) return null;

    const gridSize = 50;
    const lines = [];

    for (let x = Math.floor(viewBox.x / gridSize) * gridSize; x < viewBox.x + viewBox.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={viewBox.y}
          x2={x}
          y2={viewBox.y + viewBox.height}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    }

    for (let y = Math.floor(viewBox.y / gridSize) * gridSize; y < viewBox.y + viewBox.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={viewBox.x}
          y1={y}
          x2={viewBox.x + viewBox.width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      );
    }

    return lines;
  };

  // حساب زاوية الخط
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number): number => {
    return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  };

  // رسم العناصر
  const renderElements = () => {
    const elements: React.ReactElement[] = [];

    // رسم الأنابيب أولاً (في الخلف)
    pipes.forEach((pipe) => {
      const node1 = junctions.get(pipe.node1) || reservoirs.get(pipe.node1) || tanks.get(pipe.node1);
      const node2 = junctions.get(pipe.node2) || reservoirs.get(pipe.node2) || tanks.get(pipe.node2);
      if (!node1 || !node2) return;

      const isSelected = selectedIds.has(pipe.id);
      const isHovered = hoveredNode === pipe.node1 || hoveredNode === pipe.node2;
      
      let strokeColor = pipe.status === 'Closed' ? '#999999' : (isSelected ? '#FF0000' : isHovered ? '#3B82F6' : '#666666');
      
      if (showVelocityColors && results) {
        const linkResult = getLinkResult(pipe.id);
        if (linkResult && linkResult.velocity) {
          const velocity = Math.abs(linkResult.velocity[currentTime] || 0);
          strokeColor = getVelocityColor(velocity);
        }
      }
      
      const strokeWidth = isSelected ? 4 : (pipe.status === 'Closed' ? 1 : 2);

      elements.push(
        <g key={pipe.id}>
          <line
            x1={node1.coordinates.x}
            y1={node1.coordinates.y}
            x2={node2.coordinates.x}
            y2={node2.coordinates.y}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectElement(pipe.id, e.ctrlKey);
              onElementSelect(pipe.id);
            }}
          />
          {pipe.checkValve && (
            <g transform={`translate(${(node1.coordinates.x + node2.coordinates.x) / 2}, ${(node1.coordinates.y + node2.coordinates.y) / 2}) rotate(${calculateAngle(node1.coordinates.x, node1.coordinates.y, node2.coordinates.x, node2.coordinates.y)})`}>
              <polygon points="0,-6 6,0 0,6 -6,0" fill="white" stroke="#666666" strokeWidth="1.5"/>
              <line x1={-4} y1={-4} x2={4} y2={4} stroke="#666666" strokeWidth="1"/>
            </g>
          )}
          {pipe.status === 'Closed' && (
            <g transform={`translate(${(node1.coordinates.x + node2.coordinates.x) / 2}, ${(node1.coordinates.y + node2.coordinates.y) / 2})`}>
              <line x1={-6} y1={-6} x2={6} y2={6} stroke="#FF0000" strokeWidth="2"/>
              <line x1={6} y1={-6} x2={-6} y2={6} stroke="#FF0000" strokeWidth="2"/>
            </g>
          )}
          {renderFlowArrows(pipe, node1, node2)}
        </g>
      );
    });

    // رسم المضخات
    pumps.forEach((pump) => {
      const node1 = junctions.get(pump.node1) || reservoirs.get(pump.node1) || tanks.get(pump.node1);
      const node2 = junctions.get(pump.node2) || reservoirs.get(pump.node2) || tanks.get(pump.node2);
      if (!node1 || !node2) return;

      const isSelected = selectedIds.has(pump.id);
      const midX = (node1.coordinates.x + node2.coordinates.x) / 2;
      const midY = (node1.coordinates.y + node2.coordinates.y) / 2;
      const angle = calculateAngle(node1.coordinates.x, node1.coordinates.y, node2.coordinates.x, node2.coordinates.y);

      elements.push(
        <g key={pump.id}>
          <line
            x1={node1.coordinates.x}
            y1={node1.coordinates.y}
            x2={midX - 14}
            y2={midY}
            stroke="#666666"
            strokeWidth="2"
            transform={`rotate(${angle}, ${midX}, ${midY})`}
          />
          <line
            x1={midX + 14}
            y1={midY}
            x2={node2.coordinates.x}
            y2={node2.coordinates.y}
            stroke="#666666"
            strokeWidth="2"
            transform={`rotate(${angle}, ${midX}, ${midY})`}
          />
          <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
            <circle r={14} fill="#FFF0E6" stroke={isSelected ? '#FF0000' : '#FF6600'} strokeWidth={isSelected ? 3 : 2} className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                selectElement(pump.id, e.ctrlKey);
                onElementSelect(pump.id);
              }}
            />
            <circle r={6} fill="white" stroke="#FF6600" strokeWidth="1.5"/>
            <line x1={0} y1={-6} x2={0} y2={6} stroke="#FF6600" strokeWidth="2"/>
            <line x1={-6} y1={0} x2={6} y2={0} stroke="#FF6600" strokeWidth="2"/>
            <path d="M0,-14 L3,-10 L-3,-10 Z" fill="#FF6600"/>
          </g>
        </g>
      );
    });

    // رسم الصمامات
    valves.forEach((valve) => {
      const node1 = junctions.get(valve.node1) || reservoirs.get(valve.node1) || tanks.get(valve.node1);
      const node2 = junctions.get(valve.node2) || reservoirs.get(valve.node2) || tanks.get(valve.node2);
      if (!node1 || !node2) return;

      const isSelected = selectedIds.has(valve.id);
      const midX = (node1.coordinates.x + node2.coordinates.x) / 2;
      const midY = (node1.coordinates.y + node2.coordinates.y) / 2;
      const angle = calculateAngle(node1.coordinates.x, node1.coordinates.y, node2.coordinates.x, node2.coordinates.y);

      elements.push(
        <g key={valve.id}>
          <line
            x1={node1.coordinates.x}
            y1={node1.coordinates.y}
            x2={midX - 10}
            y2={midY}
            stroke="#666666"
            strokeWidth="2"
            transform={`rotate(${angle}, ${midX}, ${midY})`}
          />
          <line
            x1={midX + 10}
            y1={midY}
            x2={node2.coordinates.x}
            y2={node2.coordinates.y}
            stroke="#666666"
            strokeWidth="2"
            transform={`rotate(${angle}, ${midX}, ${midY})`}
          />
          <g transform={`translate(${midX}, ${midY}) rotate(${angle})`}>
            <rect x={-8} y={-8} width={16} height={16} fill="#F3E8FF" stroke={isSelected ? '#FF0000' : '#9333EA'} strokeWidth={isSelected ? 3 : 2} className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                selectElement(valve.id, e.ctrlKey);
                onElementSelect(valve.id);
              }}
            />
            <line x1={-8} y1={-8} x2={8} y2={8} stroke="#9333EA" strokeWidth="1.5"/>
            <line x1={8} y1={-8} x2={-8} y2={8} stroke="#9333EA" strokeWidth="1.5"/>
            <circle cy={-12} r={3} fill="#9333EA"/>
            <line x1={0} y1={-8} x2={0} y2={-9} stroke="#9333EA" strokeWidth="1.5"/>
          </g>
        </g>
      );
    });

    // رسم العقد
    junctions.forEach((junction) => {
      const isSelected = selectedIds.has(junction.id);
      const isHovered = hoveredNode === junction.id;
      
      let fillColor = "#FFFFFF";
      let strokeColor = isSelected ? '#FF0000' : '#0066CC';
      
      if (showPressureColors && results) {
        const nodeResult = getNodeResult(junction.id);
        if (nodeResult && nodeResult.pressure) {
          const pressure = nodeResult.pressure[currentTime] || 0;
          fillColor = getPressureColor(pressure);
          strokeColor = fillColor;
        }
      }

      elements.push(
        <g key={junction.id} transform={`translate(${junction.coordinates.x}, ${junction.coordinates.y})`}>
          <circle
            r={isSelected ? 8 : isHovered ? 7 : 6}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 3 : 2}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectElement(junction.id, e.ctrlKey);
              onElementSelect(junction.id);
            }}
          />
          <circle r={2} fill="#0066CC"/>
        </g>
      );
    });

    // رسم الخزائن الرئيسية
    reservoirs.forEach((reservoir) => {
      const isSelected = selectedIds.has(reservoir.id);
      const { x, y } = reservoir.coordinates;
      elements.push(
        <g key={reservoir.id} transform={`translate(${x}, ${y})`}>
          <path
            d="M0,-14 L-12,10 L12,10 Z"
            fill="#E6FAF0"
            stroke={isSelected ? '#FF0000' : '#00AA44'}
            strokeWidth={isSelected ? 3 : 2}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectElement(reservoir.id, e.ctrlKey);
              onElementSelect(reservoir.id);
            }}
          />
          <path d="M-8,10 Q0,6 8,10" stroke="#00AA44" strokeWidth="1.5" fill="none"/>
          <line x1={0} y1={-6} x2={0} y2={2} stroke="#00AA44" strokeWidth="2"/>
          <line x1={-4} y1={-2} x2={4} y2={-2} stroke="#00AA44" strokeWidth="2"/>
          <text y={-20} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">
            {reservoir.id}
          </text>
        </g>
      );
    });

    // رسم الخزائن
    tanks.forEach((tank) => {
      const isSelected = selectedIds.has(tank.id);
      const { x, y } = tank.coordinates;
      const level = tank.initialLevel || 50;
      const fillHeight = (level / 100) * 28;
      
      elements.push(
        <g key={tank.id} transform={`translate(${x}, ${y})`}>
          <rect
            x={-10}
            y={-16}
            width={20}
            height={32}
            rx={2}
            fill="#E6F7FF"
            stroke={isSelected ? '#FF0000' : '#0099CC'}
            strokeWidth={isSelected ? 3 : 2}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              selectElement(tank.id, e.ctrlKey);
              onElementSelect(tank.id);
            }}
          />
          <rect
            x={-10}
            y={16 - fillHeight}
            width={20}
            height={fillHeight}
            fill="#0099CC"
            opacity="0.3"
            rx={2}
          />
          <line x1={-6} y1={-16} x2={-6} y2={16} stroke="#0099CC" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
          <line x1={6} y1={-16} x2={6} y2={16} stroke="#0099CC" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
          <line x1={-10} y1={-4} x2={10} y2={-4} stroke="#0099CC" strokeWidth="1" opacity="0.3"/>
          <line x1={-10} y1={8} x2={10} y2={8} stroke="#0099CC" strokeWidth="1" opacity="0.3"/>
          <text y={-22} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">
            {tank.id}
          </text>
        </g>
      );
    });

    return elements;
  };

  // نقطة التحويم
  const renderHoverIndicator = () => {
    if (!hoveredNode) return null;
    
    const node = junctions.get(hoveredNode) || reservoirs.get(hoveredNode) || tanks.get(hoveredNode);
    if (!node) return null;

    return (
      <circle
        cx={node.coordinates.x}
        cy={node.coordinates.y}
        r={15}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeDasharray="4 2"
        opacity="0.6"
        pointerEvents="none"
      />
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50">
      <svg
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : selectedTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      >
        {/* خريطة الخلفية */}
        {showBackgroundMap && backgroundMapType === 'osm' && (
          <g opacity="0.3">
            <defs>
              <pattern id="gridPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="#f0f0f0"/>
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ddd" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="url(#gridPattern)"/>
          </g>
        )}
        
        {renderGrid()}
        {renderElements()}
        {renderDrawingLines()}
        {renderLabels()}
        {renderScaleBar()}
        {renderLegend()}
        {renderHoverIndicator()}
        
        {/* عنصر مؤقت أثناء الرسم */}
        {tempElement && (
          <line
            x1={tempElement.start.x}
            y1={tempElement.start.y}
            x2={tempElement.end.x}
            y2={tempElement.end.y}
            stroke="#3B82F6"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
          />
        )}
        
        {/* تعريف السهم */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>

      {/* أدوات التكبير والتمركز المحسنة */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
          {/* Zoom In */}
          <button
            onClick={() => {
              const centerX = viewBox.x + viewBox.width / 2;
              const centerY = viewBox.y + viewBox.height / 2;
              const newZoom = Math.min(5, zoom * 1.2);
              const newWidth = viewBox.width * (zoom / newZoom);
              const newHeight = viewBox.height * (zoom / newZoom);
              const newX = centerX - newWidth / 2;
              const newY = centerY - newHeight / 2;
              panView(viewBox.x - newX, viewBox.y - newY);
              setZoom(newZoom);
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
            title="تكبير (+)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          {/* Zoom Level Display */}
          <div className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-gray-700 bg-gray-50">
            {Math.round(zoom * 100)}%
          </div>
          
          {/* Zoom Out */}
          <button
            onClick={() => {
              const centerX = viewBox.x + viewBox.width / 2;
              const centerY = viewBox.y + viewBox.height / 2;
              const newZoom = Math.max(0.1, zoom * 0.8);
              const newWidth = viewBox.width * (zoom / newZoom);
              const newHeight = viewBox.height * (zoom / newZoom);
              const newX = centerX - newWidth / 2;
              const newY = centerY - newHeight / 2;
              panView(viewBox.x - newX, viewBox.y - newY);
              setZoom(newZoom);
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100"
            title="تصغير (-)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          {/* Fit View */}
          <button
            onClick={fitView}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="تكيف العرض"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        
        {/* Network Stats */}
        <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-500 text-xs">عقد</span>
              <span className="font-semibold text-gray-700">{junctions.size + reservoirs.size + tanks.size}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-500 text-xs">روابط</span>
              <span className="font-semibold text-gray-700">{pipes.size + pumps.size + valves.size}</span>
            </div>
          </div>
        </div>
      </div>

      {/* تعليمات سريعة */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-3 rounded-lg shadow-md text-xs text-gray-600">
        <div className="font-semibold mb-1">اختصارات:</div>
        <div>• Shift + سحب: تحريك اللوحة</div>
        <div>• Ctrl + نقر: تحديد متعدد</div>
        <div>• Delete: حذف العناصر المحددة</div>
        <div>• عجلة الماوس: تكبير/تصغير</div>
      </div>

      {/* مؤشر وضع الربط المتقدم */}
      {['pipe', 'pump', 'valve'].includes(selectedTool) && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium z-50">
          {!isDrawingPipe ? (
            <span>🖱️ اضغط بزر الفأرة الأيسر على العقدة الأولى للبدء</span>
          ) : (
            <div className="text-center">
              <div className="mb-1">📍 الأنابيب المرسومة: {Math.max(0, pipeNodes.length - 1)}</div>
              <div className="text-xs opacity-90">
                🖱️<span className="font-bold"> زر أيسر</span>: إضافة عقدة | 
                🖱️<span className="font-bold"> زر أيمن</span>: إضافة انعطاف | 
                ⌨️ <span className="font-bold">Esc</span>: إلغاء
              </div>
              {bendType && (
                <div className="mt-1 text-yellow-200">
                  نوع الانعطاف: {bendType === 'angle' ? 'زاوية قائمة' : 'قوس'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* قائمة الانعطافات */}
      {showBendMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-[100] min-w-[160px]"
          style={{ left: bendMenuPosition.x, top: bendMenuPosition.y }}
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 mb-1">
            اختر نوع الانعطاف
          </div>
          <button
            onClick={() => addBend('angle')}
            className="w-full px-4 py-2 text-right text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <span>📐</span>
            <span>زاوية قائمة</span>
          </button>
          <button
            onClick={() => addBend('arc')}
            className="w-full px-4 py-2 text-right text-sm flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <span>⌒</span>
            <span>قوس</span>
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={() => setShowBendMenu(false)}
            className="w-full px-4 py-2 text-right text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <span>✕</span>
            <span>إلغاء</span>
          </button>
        </div>
      )}

      {/* القائمة السياقية */}
      {isContextMenuOpen && (
        <ContextMenu
          items={contextMenuItems}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
