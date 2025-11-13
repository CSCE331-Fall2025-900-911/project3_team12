import React, { useEffect, useRef, useState } from 'react';

const LENS_SIZE = 350; // px
const ZOOM = 2; // scale

export default function Magnifier() {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lensRef = useRef<HTMLDivElement | null>(null);
  const cloneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
    }

    if (active) {
      document.addEventListener('mousemove', handleMove);
      // create clone of the app root to render inside the lens
      const root = document.getElementById('root') || document.body;
      const clone = (root.cloneNode(true) as HTMLElement) || null;
      if (clone) {
        // remove ids that might conflict
        clone.removeAttribute('id');
        // mark clone for identification
        clone.setAttribute('data-magnifier-clone', 'true');
        clone.style.pointerEvents = 'none';
        clone.style.userSelect = 'none';
        // position clone absolutely so transforms align with document coords
        clone.style.position = 'absolute';
        clone.style.left = '0px';
        clone.style.top = '0px';
        // size clone to full document to match document coordinates (including scrollable area)
        clone.style.width = `${document.documentElement.scrollWidth}px`;
        clone.style.height = `${document.documentElement.scrollHeight}px`;
        clone.style.boxSizing = 'border-box';
      }
      cloneRef.current = clone;
      // append clone inside lens element
      if (lensRef.current && cloneRef.current) {
        // clear previous
        lensRef.current.innerHTML = '';
        lensRef.current.appendChild(cloneRef.current);
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      // cleanup clone
      if (cloneRef.current && cloneRef.current.parentElement) {
        cloneRef.current.parentElement.removeChild(cloneRef.current);
      }
      cloneRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    // update lens transform / position when mouse moves
    const lens = lensRef.current;
    const clone = cloneRef.current;
    if (!active || !lens || !clone) return;

    const cx = pos.x;
    const cy = pos.y;

    const left = cx - LENS_SIZE / 2;
    const top = cy - LENS_SIZE / 2;
    lens.style.left = `${left}px`;
    lens.style.top = `${top}px`;

    // Document coordinates (account for scroll)
    const docX = window.scrollX + cx;
    const docY = window.scrollY + cy;

    // We want the document point (docX, docY) scaled by ZOOM to land at the
    // center of the lens (LENS_SIZE/2, LENS_SIZE/2). So solve for translate:
    // translateX = LENS_SIZE/2 - docX * ZOOM
    const translateX = LENS_SIZE / 2 - docX * ZOOM;
    const translateY = LENS_SIZE / 2 - docY * ZOOM;

    clone.style.transformOrigin = '0 0';
    clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${ZOOM})`;
  }, [pos, active]);

  return (
    <>
      <button
        aria-pressed={active}
        onClick={() => setActive(v => !v)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 9999,
          padding: '10px 12px',
          borderRadius: 8,
          border: 'none',
          background: active ? '#111' : '#fff',
          color: active ? '#fff' : '#111',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        }}
      >
        {active ? 'Disable Magnifier' : 'Enable Magnifier'}
      </button>

      {active && (
        <div
          ref={lensRef}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: LENS_SIZE,
            height: LENS_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 9998,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            border: '3px solid rgba(255,255,255,0.9)',
            backdropFilter: 'none',
            background: '#fff',
          }}
        />
      )}
    </>
  );
}
