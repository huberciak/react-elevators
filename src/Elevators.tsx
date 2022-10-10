import React from 'react';
import {useState} from 'react';

import { myElevatorSystem, Direction, Status, Pickup, Elevator} from './elevatorSystem';
import './Elevators.css';
import { sys } from 'typescript';

const noOfFloors = 15;
const noOfElevators = 5;

let myData: Elevator[] = []

for(let i=1;i<noOfElevators+1;i++) {
  myData.push({
    id: i,
    currentFloor: 0,
    floorQueue:[],
    elevatorType: Direction.STATIC,
  })
}

export const system = new myElevatorSystem(myData);

export const Elevators: React.FC = () => {
  let floors:number[] = [];
  for(let i = 0; i < noOfFloors; i++) {
    floors.push(noOfFloors - i - 1);
  }
  
  const pickupHandler = (
    current: number, 
    direction: Direction, 
    destination: number | null,
    ) => {
      system.pickup(current, direction, destination);
      console.log(system.status());
  }

  const stepHandler = () => {
    console.log(system.status());
    system.step();
    setActiveFloors(system.status().map(e => e.currentFloor));
  }

  const [activeFloors, setActiveFloors] = useState(system.status().map(e => e.currentFloor))
  return(
    <div className='container'>
      <ul className='elevators'>
        {myData.map(elevator=> {
          return <li className='elevator' key={elevator.id}>{
            <ul className='floors'>
              <div className='current'>{activeFloors[elevator.id - 1]}</div>
              {floors.map(floor=> {
                return <li 
                  className={`floor ${floor===activeFloors[elevator.id - 1] ? "active" : ""}` }
                  key={floor}
                  >
                    {floor}
                  </li>
              })}
            </ul>
          }
        </li>
        })}
        <li className='elevator'>
        {floors.map(floor=> {
          return <li className='floor'
        >
          {floor}
          <button
            onClick={event=>pickupHandler(floor, Direction.UP, 0)}
          >↑</button>
          <button
            onClick={event=>pickupHandler(floor, Direction.DOWN, 0)}
          >↓</button>
        </li>
      })}

      </li>
      </ul>
      <button
        onClick={event=>stepHandler()}
      >
        STEP
      </button>
    </div>
  )
}

export default Elevators;