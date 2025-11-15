// Floor 1 fixed desk marker positions (percent of image width/height)
// Chỉnh các giá trị này để marker đè khít lên số trên ảnh floor1.png
// Key phải là 'FD-<n>' (không số 0 ở đầu), ví dụ 'FD-1'..'FD-21'

export const FLOOR1_SEAT_POSITIONS: Record<string, { posX: number; posY: number }> = {
  // Cột trái (ví dụ; bạn chỉnh tuỳ theo ảnh của bạn)
  'FD-1': { posX: 3.7, posY: 96.4 },
  'FD-2': { posX: 3.7, posY: 86.2 },
  'FD-3': { posX: 3.7, posY: 75.9 },
  'FD-4': { posX: 3.9, posY: 65.9 },
  'FD-5': { posX: 3.7, posY: 55.6 },
  'FD-6': { posX: 3.7, posY: 45.4 },
  'FD-7': { posX: 3.7, posY: 35.2 },
  'FD-8': { posX: 3.7, posY: 24.9 },

  // Hàng trên (ví dụ; bạn chỉnh tuỳ theo ảnh của bạn)
  'FD-9': { posX: 5, posY: 3.7 },
  'FD-10': { posX: 12.3, posY: 3.7 },
  'FD-11': { posX: 19.8, posY: 3.7 },
  'FD-12': { posX: 27.3, posY: 3.7 },
  'FD-13': { posX: 35, posY: 3.7 },
  'FD-14': { posX: 42.4, posY: 3.7 },
  'FD-15': { posX: 49.9, posY: 3.7 },
  'FD-16': { posX: 57.5, posY: 3.7 },
  'FD-17': { posX: 65, posY: 3.7 },
  'FD-18': { posX: 72.3, posY: 3.7 },
  'FD-19': { posX: 79.8, posY: 3.7 },
  'FD-20': { posX: 87.1, posY: 3.7 },
  'FD-21': { posX: 94.6, posY: 3.7 },
};