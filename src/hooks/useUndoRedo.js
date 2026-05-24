import { useState, useCallback } from "react";

export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const updateState = useCallback((newState) => {
    setState(newState);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setState(history[newIndex]);
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setState(history[newIndex]);
  }, [canRedo, currentIndex, history]);

  const reset = useCallback((newState = initialState) => {
    setState(newState);
    setHistory([newState]);
    setCurrentIndex(0);
  }, [initialState]);

  return {
    state,
    updateState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyLength: history.length
  };
};
