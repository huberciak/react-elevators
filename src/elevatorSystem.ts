export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  STATIC = "STAYING",
}

export interface Pickup {
  (floor: number, direction: Direction, destinationFloor: number | null): [number, number] | void;
}

export interface Update {
  (elevatorId: number, destinationFloor: number | null): 
  void;
}

export interface Step {
  (): void;
}

export interface Status {
  (): Elevator[];
}
interface Query {
  floor: number,
  direction: Direction,
  destinationFloor: number | null,
}

export interface Elevator {
  id: number;
  currentFloor: number;
  floorQueue: (Query)[];
  elevatorType: Direction;
}

interface ElevatorSystem {
  pickup: Pickup;
  update: Update;
  step: Step;
  status: Status;
}

export class myElevatorSystem implements ElevatorSystem {

  data: Elevator[];

  constructor(data: Elevator[]) {
    this.data = data;
  }

  pickup: Pickup = (floor, direction, destinationFloor) => {
    const currentStatus = this.status();

    //default elevator is no. 1
    let chosenElevatorId = 1;
    
    const downDirectionElevators = currentStatus.filter((elevator) => {
      return elevator.elevatorType === Direction.DOWN;
    })
    const upDirectionElevators = currentStatus.filter((elevator) => {
      return elevator.elevatorType === Direction.UP;
    })

    const chooseElevator = (elevatorsArray: Elevator[]): [number, number] => {
      let minDistance = Infinity;
      for(let elevator of elevatorsArray) {
        const {floorQueue, id, currentFloor} = elevator;
        let newDistance = 0;
      
        for(let i = 0; i < floorQueue.length - 1; i++) {
          newDistance += Math.abs(
            floorQueue[i].floor - floorQueue[i+1].floor
          )
        }

        if (floorQueue.length === 0){
          newDistance += Math.abs(currentFloor - floor)
        } else {
          newDistance += Math.abs(
            floorQueue[0]?.floor - currentFloor);

          newDistance += Math.abs(
            floorQueue[floorQueue.length -1]?.floor - floor
          );
        }

        if (newDistance < minDistance) {
          minDistance = newDistance;
          chosenElevatorId = id;
      }
    }
      return [chosenElevatorId, minDistance];
    }

    const elevatorsWithDestination = 
    currentStatus.filter((elevator) => {
      return (elevator.elevatorType === Direction.STATIC)
    });
    
    let sameDirectionElevatorDistance = Infinity;
    let staticElevatorDistance = Infinity;

    //DOWN DIRECTION
    if (direction === Direction.DOWN) {
      let chosenElevator: Elevator | undefined = undefined;

      const aboveElevators = downDirectionElevators.filter((elevator) => {
        return (elevator.currentFloor >= floor)
      });


 
      if (aboveElevators.length !== 0) {
        const chosenElevatorId = chooseElevator(aboveElevators)[0];
        sameDirectionElevatorDistance = chooseElevator(aboveElevators)[1];

        chosenElevator = currentStatus.filter(elevator => 
          elevator.id === chosenElevatorId)[0];
      }

      const chosenElevatorId = chooseElevator(elevatorsWithDestination)[0];
      chosenElevator = currentStatus.filter(elevator => 
        elevator.id === chosenElevatorId)[0];
    
      staticElevatorDistance = chooseElevator(elevatorsWithDestination)[1];

      if(sameDirectionElevatorDistance > staticElevatorDistance) {
        chosenElevator = currentStatus.filter(elevator => 
          elevator.id === chosenElevatorId)[0];
      }

      if(chosenElevator) {
      chosenElevator.floorQueue.push({
        floor: floor, 
        direction: direction,
        destinationFloor: destinationFloor,
      });

      chosenElevator.elevatorType = Direction.DOWN;
      }
      console.log(`From floor ${floor} go ${direction} with elevator ${chosenElevatorId}`);
    }

    //UP DIRECTION
    if (direction === Direction.UP) {
      let chosenElevator: Elevator | undefined = undefined;

      const belowElevators = upDirectionElevators.filter((elevator) => {
        return (elevator.currentFloor <= floor)
      });

      if (belowElevators.length !== 0) {
        const chosenElevatorId = chooseElevator(belowElevators)[0];
        sameDirectionElevatorDistance = chooseElevator(belowElevators)[1];

        chosenElevator = currentStatus.filter(elevator => 
          elevator.id === chosenElevatorId)[0];
      }

      const chosenElevatorId = chooseElevator(elevatorsWithDestination)[0];

      chosenElevator = currentStatus.filter(elevator => 
        elevator.id === chosenElevatorId)[0];
  
      staticElevatorDistance = chooseElevator(elevatorsWithDestination)[1];

      if(sameDirectionElevatorDistance > staticElevatorDistance) {
        chosenElevator = currentStatus.filter(elevator => 
          elevator.id === chosenElevatorId)[0];
    }

    if(chosenElevator){
      chosenElevator.floorQueue.push({
        floor: floor, 
        direction: direction,
        destinationFloor: destinationFloor,
      });      
      chosenElevator.elevatorType = Direction.UP;
    }
    console.log(`From floor ${floor} go ${direction} with elevator ${chosenElevatorId}`);
    }
}
//update destination of elevator after you reach floor where Pickup was run
  update: Update = (elevatorId, destinationFloor) => {
    console.log("Update", elevatorId, destinationFloor)
    const currentStatus = this.data;
    let newData = [];
    const chosenElevator = currentStatus.filter(elevator => 
      elevator.id === elevatorId)[0];
    
      if(destinationFloor === 0){
        console.log("Destination pushed")
        chosenElevator.floorQueue.push(
        {
          floor: destinationFloor, 
          direction: Direction.STATIC,
          destinationFloor: null,
      });
    }
    //const newQueue: Query[] = [chosenElevator.floorQueue]
    const newElevator = {
      ...chosenElevator,
      elevatorType: Direction.STATIC,
      floorQueue: [chosenElevator.floorQueue.shift()],
    }

    newData = currentStatus.map((elevator) => {
      if(elevator.id === elevatorId) {
        return newElevator as Elevator;
      } else {
        return elevator;
      }
    });

    this.data = [...newData];
    console.log(this.data)

  };

  step: Step = () => {
    console.log("STEP");
    const currentStatus = this.status();
    const newData = [];
    
    for(let elevator of currentStatus) {
      if(elevator.floorQueue.length===0) {
        newData.push(elevator);
      }
      let {id, currentFloor, floorQueue} = elevator;
      if(currentFloor < floorQueue[0]?.floor) {
        console.log(id, "UP");
        currentFloor++;
        elevator = {...elevator,
          currentFloor: currentFloor,
        }      

        if(currentFloor===floorQueue[0].floor){
          console.log("destination reached");
          this.update(id, floorQueue[0].destinationFloor);
        }
        newData.push(elevator);
      } else if(currentFloor > floorQueue[0]?.floor) {
        console.log(id, "DOWN");
        currentFloor--;
        elevator = {...elevator,
          currentFloor: currentFloor,
        }

        if(currentFloor===floorQueue[0].floor){
          console.log("destination reached");
          this.update(id, floorQueue[0].destinationFloor)
        }
        newData.push(elevator);
      }
    }
    this.data = newData;
  };

  status: Status = () => {
    return this.data;
  };
}

let myData: Elevator[] = [
  {
    id: 1, 
    currentFloor:5, 
    floorQueue:[],   
    elevatorType: Direction.STATIC
  }
]

export const system = new myElevatorSystem(myData);
