
import { useState, useRef, useCallback, useEffect } from 'react';

const MIN_SCALE = 0.8;
const MAX_SCALE = 8;

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface PanZoomOptions {
  contentRef: React.RefObject<HTMLElement>;
  viewportRef: React.RefObject<HTMLElement>;
}

export const usePanZoom = ({ contentRef, viewportRef }: PanZoomOptions) => {
    const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
    const [isTransitioning, setIsTransitioning] = useState(false);
    
    const interaction = useRef({
        isPanning: false,
        startPan: { x: 0, y: 0 },
        pointers: new Map<number, React.PointerEvent>(),
        startDist: 0,
    }).current;
    
    const transitionTimer = useRef<number | null>(null);

    const applyConstraints = useCallback((scale: number, x: number, y: number): Transform => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return { scale, x, y };

        const newScale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));

        if (newScale <= 1) return { scale: newScale, x: 0, y: 0 };
        
        const contentRect = content.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        
        const contentWidth = contentRect.width / transform.scale;
        const contentHeight = contentRect.height / transform.scale;

        const maxOffsetX = Math.max(0, (contentWidth * newScale - viewportRect.width) / 2);
        const maxOffsetY = Math.max(0, (contentHeight * newScale - viewportRect.height) / 2);

        return {
            scale: newScale,
            x: Math.max(-maxOffsetX, Math.min(x, maxOffsetX)),
            y: Math.max(-maxOffsetY, Math.min(y, maxOffsetY)),
        };
    }, [viewportRef, contentRef, transform.scale]);

    const updateTransform = useCallback((newVals: Partial<Transform>, isInstant = false) => {
        if (!isInstant) {
            setIsTransitioning(true);
            if (transitionTimer.current) clearTimeout(transitionTimer.current);
            transitionTimer.current = window.setTimeout(() => setIsTransitioning(false), 200);
        }
        setTransform(prev => {
            const temp = { ...prev, ...newVals };
            return applyConstraints(temp.scale, temp.x, temp.y);
        });
    }, [applyConstraints]);
    
    const resetZoom = useCallback(() => updateTransform({ scale: 1, x: 0, y: 0 }), [updateTransform]);
    const zoomIn = useCallback(() => updateTransform({ scale: transform.scale * 1.5 }), [transform.scale, updateTransform]);
    const zoomOut = useCallback(() => updateTransform({ scale: transform.scale / 1.5 }), [transform.scale, updateTransform]);

    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const viewport = viewportRef.current;
        if (!viewport) return;

        const zoomFactor = 1 - e.deltaY * 0.002;
        const newScale = transform.scale * zoomFactor;
        
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - transform.x) * zoomFactor;
        const newY = mouseY - (mouseY - transform.y) * zoomFactor;
        
        updateTransform({ scale: newScale, x: newX, y: newY }, true);
    }, [transform, updateTransform, viewportRef]);

    const onDoubleClick = useCallback((e: React.MouseEvent) => {
        if (transform.scale > 1.1) {
            resetZoom();
        } else {
            const viewport = viewportRef.current;
            if (!viewport) return;
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const newScale = 3;
            updateTransform({
                scale: newScale,
                x: (rect.width / 2) - mouseX * newScale,
                y: (rect.height / 2) - mouseY * newScale
            });
        }
    }, [transform.scale, resetZoom, updateTransform, viewportRef]);

    const onPointerDown = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        interaction.pointers.set(e.pointerId, e);
        if (interaction.pointers.size === 1) {
            interaction.isPanning = true;
            interaction.startPan = { x: e.clientX, y: e.clientY };
        } else if (interaction.pointers.size === 2) {
            interaction.isPanning = false;
            const p = Array.from(interaction.pointers.values());
            interaction.startDist = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!interaction.pointers.has(e.pointerId)) return;
        interaction.pointers.set(e.pointerId, e);

        if (interaction.isPanning && interaction.pointers.size === 1) {
            const dx = e.clientX - interaction.startPan.x;
            const dy = e.clientY - interaction.startPan.y;
            interaction.startPan = { x: e.clientX, y: e.clientY };
            updateTransform({ x: transform.x + dx, y: transform.y + dy }, true);
        } else if (interaction.pointers.size === 2) {
            const viewport = viewportRef.current;
            if (!viewport) return;

            const p = Array.from(interaction.pointers.values());
            const dist = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY);
            if (interaction.startDist === 0) {
                interaction.startDist = dist;
                return;
            }
            const zoom = dist / interaction.startDist;
            interaction.startDist = dist;
            
            const newScale = transform.scale * zoom;
            const rect = viewport.getBoundingClientRect();
            const cx = (p[0].clientX + p[1].clientX) / 2 - rect.left;
            const cy = (p[0].clientY + p[1].clientY) / 2 - rect.top;
            const newX = cx - (cx - transform.x) * zoom;
            const newY = cy - (cy - transform.y) * zoom;
            updateTransform({ scale: newScale, x: newX, y: newY }, true);
        }
    };
    
    const onPointerUp = (e: React.PointerEvent) => {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        interaction.pointers.delete(e.pointerId);
        if (interaction.pointers.size < 2) {
            if (interaction.pointers.size === 1) {
                const p = Array.from(interaction.pointers.values())[0];
                interaction.isPanning = true;
                interaction.startPan = { x: p.clientX, y: p.clientY };
            } else {
                interaction.isPanning = false;
            }
        }
    };

    return {
        transform,
        isTransitioning,
        eventHandlers: {
            onWheel,
            onDoubleClick,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
        },
        zoomIn,
        zoomOut,
        resetZoom
    };
};
