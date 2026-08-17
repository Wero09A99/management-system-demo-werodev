import { EVENTOS, type NombreEvento, type PayloadPorEvento } from "./events";

type Listener<T> = (payload: T) => void;

/**
 * Event bus ligero en memoria, usable tanto en cliente como en servidor.
 * Los listeners se tipan por evento usando `PayloadPorEvento`.
 * No está pensado para persistencia ni para notificaciones en tiempo real
 * entre procesos; su función es desacoplar emisores de consumidores dentro
 * de un mismo runtime (notificar UI tras crear/resolver una solicitud).
 */
export class EventBus {
  private listeners = new Map<NombreEvento, Set<Listener<unknown>>>();

  on<E extends NombreEvento>(evento: E, listener: Listener<PayloadPorEvento[E]>): () => void {
    let set = this.listeners.get(evento);
    if (!set) {
      set = new Set();
      this.listeners.set(evento, set);
    }
    set.add(listener as Listener<unknown>);
    return () => this.off(evento, listener as Listener<unknown>);
  }

  off<E extends NombreEvento>(evento: E, listener: Listener<PayloadPorEvento[E]>): void {
    this.listeners.get(evento)?.delete(listener as Listener<unknown>);
  }

  emit<E extends NombreEvento>(evento: E, payload: PayloadPorEvento[E]): void {
    this.listeners.get(evento)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`[eventBus] Error en listener de "${evento}":`, error);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** Instancia global compartida del event bus. */
export const eventBus = new EventBus();

// Re-export por conveniencia.
export { EVENTOS };