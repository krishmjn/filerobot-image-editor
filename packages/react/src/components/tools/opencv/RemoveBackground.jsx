/** External Dependencies */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/** Internal Dependencies */
import ToolsBarItemButton from 'components/ToolsBar/ToolsBarItemButton';
import { TOOLS_IDS } from 'utils/constants';
import { useStore } from 'hooks';
import Slider from 'components/common/Slider';
import {
    StyledSliderContainer,
    StyledSliderInput,
    StyledSliderLabel,
    StyledSliderWrapper,
} from '../tools.styled';
import { processImageWithThreshold } from 'utils/openCvProcessing';
import { Resize } from '@scaleflex/icons';

export const RemoveBackground = ({ selectTool, isSelected, t }) => (
    <ToolsBarItemButton
        className="FIE_remove-background-tool-button"
        id={TOOLS_IDS.REMOVE_BACKGROUND}
        label={t('removeBackgroundTool')}
        Icon={Resize}
        onClick={selectTool}
        isSelected={isSelected}
    />
);

RemoveBackground.defaultProps = {
    isSelected: false,
};

RemoveBackground.propTypes = {
    selectTool: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
    t: PropTypes.func.isRequired,
};

const MIN_VALUE = 0;
const DEFAULT_VALUE = 127;
const MAX_VALUE = 255;
const sliderStyle = { width: 150, padding: 0, margin: 0 };

export const RemoveBackgroundOptions = ({ t }) => {
    const { originalImage, dispatch } = useStore();
    const [value, setValue] = useState(DEFAULT_VALUE);
    const [cvReady, setCvReady] = useState(typeof window !== 'undefined' && !!window.cv);

    useEffect(() => {
        if (!cvReady) {
            const id = setInterval(() => {
                if (typeof window !== 'undefined' && window.cv) {
                    setCvReady(true);
                    clearInterval(id);
                }
            }, 200);
            return () => clearInterval(id);
        }
        return undefined;
    }, [cvReady]);

    useEffect(() => {
        if (cvReady) {
            processImageWithThreshold('removeBackground', originalImage, dispatch, value);
        }
    }, [cvReady]);

    const onChange = (next) => {
        const v = Math.max(MIN_VALUE, Math.min(MAX_VALUE, Number(next)));
        setValue(v);
        if (cvReady) processImageWithThreshold('removeBackground', originalImage, dispatch, v);
    };

    return (
        <StyledSliderContainer className="FIE_remove-background-option-wrapper">
            <StyledSliderLabel className="FIE_remove-background-option-label">
                {t('threshold')}
            </StyledSliderLabel>
            <StyledSliderWrapper>
                <Slider
                    className="FIE_remove-background-option"
                    min={MIN_VALUE}
                    step={1}
                    max={MAX_VALUE}
                    width="124px"
                    value={value}
                    onChange={onChange}
                    style={sliderStyle}
                    disabled={!cvReady}
                />
                <StyledSliderInput
                    value={value}
                    onChange={({ target: { value: v } }) => onChange(v)}
                    disabled={!cvReady}
                />
            </StyledSliderWrapper>
        </StyledSliderContainer>
    );
};

RemoveBackgroundOptions.propTypes = {
    t: PropTypes.func.isRequired,
};

export default RemoveBackground;

