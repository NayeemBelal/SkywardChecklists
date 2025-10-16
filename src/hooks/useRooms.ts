import { useState, useCallback } from 'react';
import { Room } from '@/types';
import { roomService, RoomFormData } from '@/services/roomService';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomsByZone = useCallback(async (zoneId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getRoomsByZoneId(zoneId);
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (room: RoomFormData) => {
    try {
      setError(null);
      const newRoom = await roomService.createRoom(room);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateRoom = useCallback(async (id: number, updates: Partial<RoomFormData>) => {
    try {
      setError(null);
      const updatedRoom = await roomService.updateRoom(id, updates);
      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      return updatedRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteRoom = useCallback(async (id: number) => {
    try {
      setError(null);
      await roomService.deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    fetchRoomsByZone,
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
