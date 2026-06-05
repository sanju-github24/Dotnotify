// DotNotify — TypeScript Definitions
// Version 1.0.0

export interface DotNotifyConfig {
  /** Where notifications appear on screen. Default: 'top-right' */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  /** Visual theme. Default: 'ios-glass' */
  theme?: 'ios-glass' | 'dark' | 'light' | 'minimal';

  /** Play a subtle sound on notification appear. Default: false */
  sound?: boolean;

  /** Max notifications visible at once before queuing. Default: 4 */
  maxStack?: number;

  /** How long each notification lives in ms. Default: 4200 */
  duration?: number;

  /** CSS z-index for notifications. Default: 99999 */
  zIndex?: number;
}

export interface ActionButton {
  /** Button label text */
  label: string;

  /** Style as primary accent button. Default: false */
  primary?: boolean;

  /** Called when this action button is clicked */
  onClick?: () => void;
}

export interface FireOptions {
  /** Notification severity type */
  type: 'error' | 'success' | 'warning' | 'info';

  /** Bold heading text */
  title: string;

  /** Body message text */
  message: string;

  /**
   * Custom icon. Three options:
   *   - Emoji string: '🔥'
   *   - SVG string: '<svg>...</svg>'
   *   - Image URL string: 'https://example.com/avatar.png'
   *   - File object: from <input type="file"> or drag-drop
   *   - HTMLImageElement: existing <img> element on the page
   */
  icon?: string | File | HTMLImageElement;

  /**
   * Developer image displayed in the notification icon area.
   * Accepts URL string, File object, or HTMLImageElement.
   * When provided, it replaces the icon.
   *
   * @example
   * // URL
   * image: 'https://example.com/avatar.png'
   *
   * // File from input
   * image: fileInput.files[0]
   *
   * // HTMLImageElement
   * image: document.querySelector('#my-img')
   */
  image?: string | File | HTMLImageElement;

  /**
   * Small thumbnail image shown to the right of the message.
   * Accepts URL string.
   * @example
   * thumbnail: 'https://example.com/preview.jpg'
   */
  thumbnail?: string;

  /** Override theme for this notification only */
  theme?: 'ios-glass' | 'dark' | 'light' | 'minimal';

  /** Override duration for this notification only (ms) */
  duration?: number;

  /** Progress style. Default: 'dots' */
  progressStyle?: 'dots' | 'ring';

  /** Override the app label above the title */
  app?: string;

  /** Play sound for this notification (overrides global setting) */
  sound?: boolean;

  /** Action buttons shown at bottom of card */
  actions?: ActionButton[];
}

export interface DismissResult {
  /** How the notification was dismissed */
  dismissed: 'timeout' | 'close' | 'action' | 'swipe-left' | 'swipe-right' | 'external';

  /** Which action button was clicked (if dismissed === 'action') */
  action?: string;
}

export interface DotNotifyInstance {
  /**
   * Fire a notification. Returns a Promise that resolves when dismissed.
   *
   * @example
   * const result = await notify.fire({
   *   type: 'error',
   *   title: 'Login Failed',
   *   message: 'Invalid credentials.',
   * });
   * console.log(result.dismissed); // 'timeout' | 'close' | 'action' | ...
   */
  fire(opts: FireOptions): Promise<DismissResult>;

  /**
   * Instantly dismiss all visible notifications.
   */
  dismissAll(): void;

  /**
   * Update global config after initialization.
   */
  configure(config: Partial<DotNotifyConfig>): void;
}

/**
 * Create a DotNotify instance.
 *
 * @example
 * import DotNotify from 'dotnotify';
 *
 * const notify = DotNotify({ position: 'top-right', theme: 'ios-glass' });
 *
 * notify.fire({
 *   type: 'success',
 *   title: 'Saved!',
 *   message: 'Your profile has been updated.',
 * });
 */
declare function DotNotify(config?: DotNotifyConfig): DotNotifyInstance;

export default DotNotify;
export = DotNotify;
