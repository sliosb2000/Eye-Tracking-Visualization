import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BubbleDataPoint,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { DataFiles, VizualizationType, DataType, FXD } from './Data';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

class App extends React.Component {
  render() {
    // const data = {
    //   datasets: [
    //     {
    //       label: 'Red dataset',
    //       data: Array.from({ length: 50 }, () => ({
    //         x: faker.datatype.number({ min: 0, max: 1600 }),
    //         y: faker.datatype.number({ min: 0, max: 1200 }),
    //         r: faker.datatype.number({ min: 5, max: 20 }),
    //       })),
    //       backgroundColor: 'rgba(255, 99, 132, 0.5)',
    //     },
    //     {
    //       label: 'Blue dataset',
    //       data: Array.from({ length: 50 }, () => ({
    //         x: faker.datatype.number({ min: 0, max: 1600 }),
    //         y: faker.datatype.number({ min: 0, max: 1200 }),
    //         r: faker.datatype.number({ min: 5, max: 20 }),
    //       })),
    //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
    //     },
    //   ],
    // };
    const participantId = "p3";
    const participantData: FXD[] = DataFiles.get(participantId)!.get(VizualizationType.GRAPH)!.get(DataType.FXD)! as FXD[];
    const chartData: BubbleDataPoint[] = participantData.map(row => {
      const dataPoint: BubbleDataPoint = {
        x: row.x,
        y: row.y,
        r: 10,
      }
      return dataPoint;
    })
    const data = {
      datasets: [
        {
          label: participantId,
          data: chartData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
    
    return (
      <div className="App">
        <h1>Bubble Chart</h1>
        <Bubble options={options} data={data} />
      </div>
    );
  }
}

export default App;