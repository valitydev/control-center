import { ThemePalette as MatThemePalette } from '@angular/material/core';

export type ThemePalette = MatThemePalette;
export type StatusPalette = 'success' | 'pending' | 'neutral';
export type Color = ThemePalette | StatusPalette;
