/** External Dependencies */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import { useStore } from 'hooks';
import { SET_CROP } from 'actions';
import { StyledToolsBarItemButtonLabel } from 'components/ToolsBar/ToolsBar.styled';

const FreehandCropOptions = ({ t }) => {
    const { originalImage, dispatch, adjustments: { crop = {} } = {} } = useStore();
    const [drawing, setDrawing] = useState(false);
    const [points, setPoints] = useState([]);
    const overlayRef = useRef(null);

    const startDraw = useCallback((e) => {
        setDrawing(true);
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        setPoints([{ x: pos.x, y: pos.y }]);
    }, []);

    const draw = useCallback((e) => {
        if (!drawing) return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        setPoints((prev) => [...prev, { x: pos.x, y: pos.y }]);
    }, [drawing]);

    const stopDraw = useCallback(() => {
        setDrawing(false);
    }, []);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return undefined;
        overlay.addEventListener('mousedown', startDraw);
        overlay.addEventListener('mousemove', draw);
        overlay.addEventListener('mouseup', stopDraw);
        overlay.addEventListener('mouseleave', stopDraw);
        return () => {
            overlay.removeEventListener('mousedown', startDraw);
            overlay.removeEventListener('mousemove', draw);
            overlay.removeEventListener('mouseup', stopDraw);
            overlay.removeEventListener('mouseleave', stopDraw);
        };
    }, [startDraw, draw, stopDraw]);

    const applyCrop = () => {
        if (!points.length) return;
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const minX = Math.max(0, Math.min(...xs));
        const minY = Math.max(0, Math.min(...ys));
        const maxX = Math.min((crop?.width || originalImage.width), Math.max(...xs));
        const maxY = Math.min((crop?.height || originalImage.height), Math.max(...ys));

        dispatch({
            type: SET_CROP,
            payload: {
                width: Math.max(1, Math.round(maxX - minX)),
                height: Math.max(1, Math.round(maxY - minY)),
                x: Math.round(minX),
                y: Math.round(minY),
                dismissHistory: false,
            },
        });

        setPoints([]);
    };

    return (
        <div className="FIE_freehand-crop-options" style={{ padding: 8 }}>
            <StyledToolsBarItemButtonLabel>{t('freehandCropTool')}</StyledToolsBarItemButtonLabel>
            <div
                ref={overlayRef}
                className="FIE_freehand-crop-overlay"
                style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}
            />
            <button type="button" onClick={applyCrop} style={{ marginTop: 8 }}>
                {t('apply')}
            </button>
        </div>
    );
};

FreehandCropOptions.propTypes = {
    t: PropTypes.func.isRequired,
};

export default FreehandCropOptions;

