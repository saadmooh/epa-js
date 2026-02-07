import { useRef, useEffect, useState } from 'react';
import { useNetworkStore } from '../store';

interface MiniMapProps {
  className?: string;
  onViewportClick?: (x: number, y: number) => void;
}

export function MiniMap({ className = '', onViewportClick }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const {
    junctions,
    reservoirs,
    tanks,
    pipes,
    viewBox,
    zoom,
  } = useNetworkStore();

  // تحديث مستطيل العرض
  useEffect(() => {
    setViewportRect({
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height,
    });
  }, [viewBox]);

  // رسم الخريطة المصغرة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // مسح الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // حساب حدود الشبكة
    const allNodes = [
      ...Array.from(junctions.values()),
      ...Array.from(reservoirs.values()),
      ...Array.from(tanks.values()),
    ];

    if (allNodes.length === 0) return;

    const minX = Math.min(...allNodes.map(n => n.coordinates.x));
    const maxX = Math.max(...allNodes.map(n => n.coordinates.x));
    const minY = Math.min(...allNodes.map(n => n.coordinates.y));
    const maxY = Math.max(...allNodes.map(n => n.coordinates.y));

    const networkWidth = maxX - minX || 1;
    const networkHeight = maxY - minY || 1;
    const padding = 20;

    // حساب مقياس الرسم
    const scaleX = (canvas.width - padding * 2) / networkWidth;
    const scaleY = (canvas.height - padding * 2) / networkHeight;
    const scale = Math.min(scaleX, scaleY);

    // دالة تحويل الإحداثيات
    const transform = (x: number, y: number) => ({
      x: padding + (x - minX) * scale,
      y: padding + (y - minY) * scale,
    });

    // رسم الأنابيب
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    pipes.forEach(pipe => {
      const node1 = allNodes.find(n => n.id === pipe.node1);
      const node2 = allNodes.find(n => n.id === pipe.node2);
      
      if (node1 && node2) {
        const p1 = transform(node1.coordinates.x, node1.coordinates.y);
        const p2 = transform(node2.coordinates.x, node2.coordinates.y);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // رسم العقد
    junctions.forEach(junction => {
      const pos = transform(junction.coordinates.x, junction.coordinates.y);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    reservoirs.forEach(reservoir => {
      const pos = transform(reservoir.coordinates.x, reservoir.coordinates.y);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    tanks.forEach(tank => {
      const pos = transform(tank.coordinates.x, tank.coordinates.y);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // رسم مستطيل العرض الحالي
    const viewportX = padding + (viewBox.x - minX) * scale;
    const viewportY = padding + (viewBox.y - minY) * scale;
    const viewportW = viewBox.width * scale;
    const viewportH = viewBox.height * scale;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);

    // تظليل المنطقة خارج العرض
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(viewportX, viewportY, viewportW, viewportH);

  }, [junctions, reservoirs, tanks, pipes, viewBox]);

  // معالجة النقر على الخريطة المصغرة
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // حساب حدود الشبكة
    const allNodes = [
      ...Array.from(junctions.values()),
      ...Array.from(reservoirs.values()),
      ...Array.from(tanks.values()),
    ];

    if (allNodes.length === 0) return;

    const minX = Math.min(...allNodes.map(n => n.coordinates.x));
    const maxX = Math.max(...allNodes.map(n => n.coordinates.x));
    const minY = Math.min(...allNodes.map(n => n.coordinates.y));
    const maxY = Math.max(...allNodes.map(n => n.coordinates.y));

    const networkWidth = maxX - minX || 1;
    const networkHeight = maxY - minY || 1;
    const padding = 20;

    // حساب مقياس الرسم
    const scaleX = (canvas.width - padding * 2) / networkWidth;
    const scaleY = (canvas.height - padding * 2) / networkHeight;
    const scale = Math.min(scaleX, scaleY);

    // تحويل إحداثيات النقر إلى إحداثيات الشبكة
    const networkX = minX + (clickX - padding) / scale;
    const networkY = minY + (clickY - padding) / scale;

    // توسيط العرض على النقطة المحددة
    const newViewBoxX = networkX - viewBox.width / 2;
    const newViewBoxY = networkY - viewBox.height / 2;

    if (onViewportClick) {
      onViewportClick(newViewBoxX, newViewBoxY);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        الخريطة المصغرة
      </h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={150}
          onClick={handleClick}
          className="border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          title="انقر للانتقال إلى الموقع"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {zoom.toFixed(1)}x
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        انقر على الخريطة للانتقال إلى الموقع
      </p>
    </div>
  );
}
