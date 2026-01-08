import React, { useEffect, useRef, useState } from 'react';

type Dock = 'right' | 'left' | 'float';

interface DockableFinderProps {
  initialWidth?: number;
  initialHeight?: number;
  initialDock?: Dock;
  children: React.ReactNode;
  storageKey?: string; // persist per user
}

export const DockableFinder: React.FC<DockableFinderProps> = ({
  initialWidth = 420,
  initialHeight = 680,
  initialDock = 'right',
  storageKey = 'crc-finder-pane',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [dock, setDock] = useState<Dock>(initialDock);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({ x: 24, y: 24 }));
  const [size, setSize] = useState<{ w: number; h: number }>(() => ({ w: initialWidth, h: initialHeight }));
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  // restore from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.dock) setDock(s.dock);
        if (s.pos) setPos(s.pos);
        if (s.size) setSize(s.size);
      }
    } catch {}
  }, [storageKey]);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ dock, pos, size }));
    } catch {}
  }, [dock, pos, size, storageKey]);

  // drag events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging && !resizing) return;
      e.preventDefault();
      const step = 16; // snap grid
      if (dragging) {
        setDock('float');
        setPos((p) => ({
          x: Math.max(8, Math.round((p.x + e.movementX) / step) * step),
          y: Math.max(8, Math.round((p.y + e.movementY) / step) * step),
        }));
      } else if (resizing) {
        setSize((s) => ({
          w: Math.max(320, s.w + e.movementX * (dock === 'right' ? 1 : -1)),
          h: Math.max(420, s.h + e.movementY),
        }));
      }
    };
    const onUp = () => {
      setDragging(false);
      setResizing(false);
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, resizing, dock]);

  const startDrag = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
  };

  const startResize = (e: React.PointerEvent) => {
    setResizing(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
  };

  const style: React.CSSProperties =
    dock === 'float'
      ? { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h }
      : dock === 'right'
      ? { position: 'fixed', right: 24, top: 24, width: size.w, height: size.h }
      : { position: 'fixed', left: 24, top: 24, width: size.w, height: size.h };

  return (
    <div className="dockable-container" ref={containerRef} style={style} role="dialog" aria-label="CRC Facility Finder" aria-modal="false">
      <div className="dockable-header">
        <div
          className="dockable-grip"
          ref={handleRef}
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={320}
          aria-valuemax={960}
          aria-valuenow={size.w}
          aria-controls="finder-content"
          onPointerDown={startDrag}
          title="Drag to move (double-click to dock right)"
          onDoubleClick={() => setDock('right')}
          tabIndex={0}
        />
        <div className="dockable-title">CRC Facility Finder</div>
        <div className="dockable-actions">
          <button onClick={() => setDock(dock === 'right' ? 'left' : 'right')} aria-label="Toggle dock side">⇄</button>
          <button onClick={() => setDock('float')} aria-label="Undock into floating window">⤢</button>
          <button onClick={() => (containerRef.current ? (containerRef.current.style.display = 'none') : null)} aria-label="Close">✕</button>
        </div>
      </div>
      <div id="finder-content" className="dockable-content">{children}</div>
      <div
        className={`dockable-resize-handle ${dock === 'right' ? 'left-edge' : 'right-edge'}`}
        onPointerDown={startResize}
        title="Drag to resize"
      />
    </div>
  );
};
