import './App.css';

import { OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { useRef, useState } from 'react';
import { Vector3 } from 'three';

import { draggingAxisAtom, isDraggingEntityAtom } from './jotai/atoms';
import { entities } from './test/testData';
import type { Entity } from './types/types';

function App() {
  const [isDraggingEntity] = useAtom(isDraggingEntityAtom);
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas
        className="w-screen h-screen"
        camera={{
          fov: 45,
          position: new Vector3(0, 0, 4),
          near: 1,
          far: 10000,
        }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enabled={!isDraggingEntity} />
        {entities.map((e) => (
          <EntityMesh key={e.uuid} entity={e} />
        ))}
      </Canvas>
    </div>
  );
}

export function EntityMesh({ entity }: { entity: Entity }) {
  const [position, setPosition] = useState(() => entity.position.clone());
  const [isActive, setIsActive] = useState(false);
  return (
    <mesh
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setIsActive(!isActive);

        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }}
      position={position}
    >
      <boxGeometry
        args={[entity.dimensions.x, entity.dimensions.y, entity.dimensions.z]}
      />
      <meshStandardMaterial />
      {isActive && (
        <EntityMeshHelper
          entity={entity}
          position={position}
          setPosition={setPosition}
        />
      )}
    </mesh>
  );
}

export function EntityMeshHelper({
  entity,
  position,
  setPosition,
}: {
  entity: Entity;
  position: Vector3;
  setPosition: React.Dispatch<React.SetStateAction<Vector3>>;
}) {
  const [isActive, setIsActive] = useState(false);
  return (
    <mesh>
      <boxGeometry
        args={[
          entity.dimensions.x + 0.1,
          entity.dimensions.y + 0.1,
          entity.dimensions.z + 0.1,
        ]}
      />
      <mesh
        onPointerOver={() => setIsActive(true)}
        onPointerLeave={() => setIsActive(false)}
        position={new Vector3(0, 0, entity.dimensions.z / 2 + 0.1)}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          transparent
          opacity={0.2}
          color={isActive ? 0x000000 : 0xffffff}
          needsUpdate
        />
      </mesh>
      <meshStandardMaterial transparent opacity={0.2} color={0xffffff} />
      <EntityMovementHelpers
        entity={entity}
        position={position}
        setPosition={setPosition}
      />
    </mesh>
  );
}

export function EntityMovementHelpers({
  entity,
  position,
  setPosition,
}: {
  entity: Entity;
  position: Vector3;
  setPosition: React.Dispatch<React.SetStateAction<Vector3>>;
}) {
  return (
    <mesh>
      <MoveEntityHelper
        position={position}
        setPosition={setPosition}
        initialPosition={entity.dimensions.y / 2 + 0.5}
        direction="y"
      />
      <MoveEntityHelper
        position={position}
        setPosition={setPosition}
        initialPosition={entity.dimensions.x / 2 + 0.5}
        direction="x"
      />
      <MoveEntityHelper
        position={position}
        setPosition={setPosition}
        initialPosition={entity.dimensions.z / 2 + 0.5}
        direction="z"
      />
    </mesh>
  );
}

export function MoveEntityHelper({
  position,
  setPosition,
  direction,
  initialPosition,
}: {
  position: Vector3;
  setPosition: React.Dispatch<React.SetStateAction<Vector3>>;
  direction: 'x' | 'y' | 'z';
  initialPosition: number;
}) {
  const [isActive, setIsActive] = useState(false);
  const [isDragging, setIsDragging] = useAtom(isDraggingEntityAtom);
  const [draggingAxis, setDraggingAxis] = useAtom(draggingAxisAtom);

  const startPointerPos = useRef(0);
  const startEntityPos = useRef(0);

  const gizmoPosition: [number, number, number] =
    direction === 'x'
      ? [initialPosition, 0, 0]
      : direction === 'y'
        ? [0, initialPosition, 0]
        : [0, 0, initialPosition];

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setIsDragging(true);
    setDraggingAxis(direction);

    if (direction === 'x') {
      startPointerPos.current = e.clientX;
      startEntityPos.current = position.x;
    }

    if (direction === 'y') {
      startPointerPos.current = e.clientY;
      startEntityPos.current = position.y;
    }

    if (direction === 'z') {
      startPointerPos.current = e.clientX;
      startEntityPos.current = position.z;
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    setIsDragging(false);
    setDraggingAxis(null);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // only the axis that started the drag is allowed to move
    if (!isDragging || draggingAxis !== direction) return;

    const sensitivity = 0.01;

    if (direction === 'x') {
      const delta = startPointerPos.current - e.clientX;
      const xDelta = delta * sensitivity;
      setPosition(
        (prev) => new Vector3(startEntityPos.current - xDelta, prev.y, prev.z),
      );
    }

    if (direction === 'y') {
      const delta = startPointerPos.current - e.clientY;
      const yDelta = delta * sensitivity;
      setPosition(
        (prev) => new Vector3(prev.x, startEntityPos.current + yDelta, prev.z),
      );
    }

    if (direction === 'z') {
      const delta = startPointerPos.current - e.clientX;
      const zDelta = delta * sensitivity;
      setPosition(
        (prev) => new Vector3(prev.x, prev.y, startEntityPos.current + zDelta),
      );
    }
  };

  return (
    <mesh
      position={gizmoPosition}
      onPointerOver={() => setIsActive(true)}
      onPointerOut={() => setIsActive(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <cylinderGeometry args={[0.1, 0.1, 0.5]} />
      <meshStandardMaterial color={isActive ? 0x000000 : 0xffffff} />
    </mesh>
  );
}

export default App;
