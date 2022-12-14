import { Box, Grid, Slider, Input } from "@mui/material";
import React from "react";

interface Props {
    width?: string;
    height?: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onSliderChange?: (event: Event, newValue: number | number[]) => void;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface State {

}

class InputSlider extends React.Component<Props, State> {
    render() {
        return(
            <Box sx={{
                width: this.props.width ?? "100%",
                height: this.props.height ?? "100%",
            }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      value={this.props.value}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(event: Event, newValue: number | number[]) => {
                        if (!this.props.onSliderChange) return;
                        this.props.onSliderChange(event, newValue);
                      }}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <Input
                      value={this.props.value}
                      size="small"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        if (!this.props.onInputChange) return;
                        this.props.onInputChange(event);
                      }}
                      inputProps={{
                        step: this.props.step,
                        min: this.props.min,
                        max: this.props.max,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
        );
    }
}

export default InputSlider;