import { atom } from 'jotai';

export const isDraggingEntityAtom = atom(false);
export const draggingAxisAtom = atom<'x' | 'y' | 'z' | null>(null);
