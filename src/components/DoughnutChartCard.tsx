import React from "react";

interface Props {
    height?: string,
    width?: string;
    margin?: string;
}
interface State {

}
class DougnutChartCard extends React.Component<Props, State>{
    render() {
        return(
            <div className= "DougnutChartCard">
                <h1>
                    hi
                </h1>
            </div>
            )
        }
    }
const data = {
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  };
  export default DougnutChartCard;