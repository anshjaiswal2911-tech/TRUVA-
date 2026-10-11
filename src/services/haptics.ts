import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

let _hapticsEnabled = true;

export function isVibrationSupported(): boolean {
  return typeof window !== 'undefined' && ('vibrate' in navigator || typeof (window as any).Capacitor !== 'undefined');
}

export function isHapticsEnabled(): boolean {
  return _hapticsEnabled;
}

export function setHapticsEnabled(enabled: boolean): void {
  _hapticsEnabled = enabled;
}

export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (!_hapticsEnabled) return;
  
  // Try native Capacitor Haptics first
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        return;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        return;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        return;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        return;
    }
  } catch {
    // Fallback to Web Vibration API
  }

  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
        case 'success':
          navigator.vibrate([15, 30, 15]);
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 50, 50, 50]);
          break;
      }
    } catch {
      // Ignore
    }
  }
}

export const triggerTabHaptic = () => triggerHaptic('light');
export const triggerSelectionHaptic = () => triggerHaptic('light');
export const triggerSuccessHaptic = () => triggerHaptic('success');
export const triggerScanSuccessHaptic = () => triggerHaptic('success');
export const triggerWarningHaptic = () => triggerHaptic('warning');
export const triggerErrorHaptic = () => triggerHaptic('error');
