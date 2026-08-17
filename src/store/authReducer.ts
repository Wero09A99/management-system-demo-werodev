"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UsuarioDto } from "@/lib/auth/usuario-dto";

export type AuthState = {
  usuario: UsuarioDto | null;
  /** true cuando ya se intentó hidratar la sesión (carga inicial). */
  hidratado: boolean;
};

const initialState: AuthState = {
  usuario: null,
  hidratado: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sesionEstablecida(state, action: PayloadAction<UsuarioDto>) {
      state.usuario = action.payload;
      state.hidratado = true;
    },
    sesionCerrada(state) {
      state.usuario = null;
      state.hidratado = true;
    },
    marcadaHidratada(state) {
      state.hidratado = true;
    },
  },
});

export const { sesionEstablecida, sesionCerrada, marcadaHidratada } = authSlice.actions;
export const authReducer = authSlice.reducer;