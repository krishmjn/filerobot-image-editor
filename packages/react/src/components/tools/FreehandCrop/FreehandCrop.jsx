/** External Dependencies */
import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Custom from '@scaleflex/icons/custom';

/** Internal Dependencies */
import ToolsBarItemButton from 'components/ToolsBar/ToolsBarItemButton';
import { TOOLS_IDS } from 'utils/constants';
import { useStore } from 'hooks';
import { Modal } from '@scaleflex/ui/core';

const FingerprintFreehandCrop = ({ base64Image, onCrop }) => {
    const [croppedImg, setCroppedImg] = useState(null);
    const canvasRef = useRef(null);
    const [drawing, setDrawing] = useState(false);
    const [points, setPoints] = useState([]);

    const drawImageOnCanvas = () => {
        if (!base64Image) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = base64Image;
        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    };

    useEffect(() => {
        drawImageOnCanvas();
        setPoints([]);
        setCroppedImg(null);
    }, [base64Image]);

    const startDraw = (e) => {
        setDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        setPoints([{ x: offsetX, y: offsetY }]);

        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e) => {
        if (!drawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        setPoints((prev) => [...prev, { x: offsetX, y: offsetY }]);

        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const stopDraw = () => {
        setDrawing(false);
    };

    const cropFreehand = () => {
        if (!base64Image || points.length < 3) {
            alert('Draw a closed region first!');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(img, 0, 0);

            const croppedData = canvas.toDataURL('image/png');
            setCroppedImg(croppedData);
            if (onCrop) onCrop(croppedData);
        };
    };

    const resetCanvas = () => {
        setPoints([]);
        setCroppedImg(null);
        drawImageOnCanvas();
    };

    return (
        <div style={{ padding: 16, width: '100%', boxSizing: 'border-box' }}>
            {base64Image && (
                <div>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        style={{ border: '1px solid #ccc', maxWidth: '100%', height: 'auto' }}
                    />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={cropFreehand}>Crop Selected Region</button>
                        <button onClick={resetCanvas}>Reset</button>
                    </div>
                </div>
            )}

            {croppedImg && (
                <div style={{ marginTop: 16 }}>
                    <img src={croppedImg} alt="Cropped" style={{ border: '1px solid #ccc' }} />
                </div>
            )}
        </div>
    );
};

const FreehandCrop = ({ selectTool, isSelected, t }) => {
    const { originalImage, dispatch } = useStore();
    const [open, setOpen] = useState(false);

    const startFreehand = () => {
        selectTool(TOOLS_IDS.FREEHAND_CROP);
        setOpen(true);
    };

    const applyCrop = (dataUrl) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            dispatch({ type: 'SET_ORIGINAL_IMAGE', payload: { originalImage: img } });
            setOpen(false);
        };
        img.src = dataUrl;
    };

    return (
        <>
            <ToolsBarItemButton
                className="FIE_freehand-crop-tool-button"
                id={TOOLS_IDS.FREEHAND_CROP}
                label={t('freehandCropTool')}
                Icon={Custom}
                onClick={startFreehand}
                isSelected={isSelected}
            />
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                style={{ width: '40vw', minWidth: '40vw', maxHeight: '90vh', alignItems: "center" }}
            >
                <FingerprintFreehandCrop base64Image={originalImage?.src} onCrop={applyCrop} />
            </Modal>
        </>
    );
};

FreehandCrop.defaultProps = {
    isSelected: false,
};

FreehandCrop.propTypes = {
    selectTool: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
    t: PropTypes.func.isRequired,
};

export default FreehandCrop;
