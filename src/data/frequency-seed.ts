import type { FrequencyType } from "@/types/aviation";

export interface FrequencySeedRecord {
  type: FrequencyType;
  valueMHz: number;
  name: string;
}

export const LOCAL_FREQUENCY_SEED: Record<string, FrequencySeedRecord[]> = {
  "K67L": [
    { type: "AWOS", valueMHz: 118.525, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "K76F": [
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "K79J": [
    { type: "ASOS", valueMHz: 134.875, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.55, name: "Tower" },
    { type: "APP", valueMHz: 133.45, name: "Cairns Approach" },
    { type: "CTAF", valueMHz: 119.55, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KABE": [
    { type: "ATIS", valueMHz: 126.975, name: "ATIS" },
    { type: "DEL", valueMHz: 124.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KABI": [
    { type: "ATIS", valueMHz: 118.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 125, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KABQ": [
    { type: "ATIS", valueMHz: 118, name: "ATIS" },
    { type: "DEL", valueMHz: 119.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "TWR", valueMHz: 123.775, name: "Tower" },
    { type: "APP", valueMHz: 123.9, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KABR": [
    { type: "ASOS", valueMHz: 125.875, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KABY": [
    { type: "ATIS", valueMHz: 133.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.25, name: "Tower" },
    { type: "CTAF", valueMHz: 120.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KACK": [
    { type: "ATIS", valueMHz: 127.5, name: "ATIS" },
    { type: "DEL", valueMHz: 119.375, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 126.1, name: "Cape Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KACT": [
    { type: "ATIS", valueMHz: 123.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 135.2, name: "Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KACV": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KACY": [
    { type: "DEL", valueMHz: 127.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Approach" }
  ],
  "KADH": [
    { type: "AWOS", valueMHz: 118.725, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KADW": [
    { type: "DEL", valueMHz: 127.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 119.3, name: "Potomac Approach" }
  ],
  "KAEG": [
    { type: "AWOS", valueMHz: 119.025, name: "AWOS" },
    { type: "DEL", valueMHz: 124.8, name: "Clearance Delivery" },
    { type: "TWR", valueMHz: 120.15, name: "Tower" },
    { type: "APP", valueMHz: 127.4, name: "Albuquerque Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KAEX": [
    { type: "ASOS", valueMHz: 123.975, name: "ASOS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.35, name: "Tower" },
    { type: "APP", valueMHz: 132.05, name: "Polk Approach" },
    { type: "CTAF", valueMHz: 127.35, name: "CTAF" }
  ],
  "KAFW": [
    { type: "ATIS", valueMHz: 126.925, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.925, name: "ASOS" },
    { type: "DEL", valueMHz: 128.725, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 132.65, name: "Ground" },
    { type: "TWR", valueMHz: 120.825, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Regional Approach" }
  ],
  "KAGC": [
    { type: "ATIS", valueMHz: 120.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 121.1, name: "Tower" },
    { type: "APP", valueMHz: 119.35, name: "Pittsburgh Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAGS": [
    { type: "ATIS", valueMHz: 132.75, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.15, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAHN": [
    { type: "ASOS", valueMHz: 132.875, name: "ASOS" },
    { type: "DEL", valueMHz: 127.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "APP", valueMHz: 127.5, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAIA": [
    { type: "ASOS", valueMHz: 135.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KAKR": [
    { type: "ASOS", valueMHz: 126.825, name: "ASOS" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "CTAF", valueMHz: 123.075, name: "CTAF" }
  ],
  "KALB": [
    { type: "ATIS", valueMHz: 120.45, name: "ATIS" },
    { type: "DEL", valueMHz: 127.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Approach" },
    { type: "APP", valueMHz: 132.825, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KALI": [
    { type: "ASOS", valueMHz: 119.225, name: "ASOS" },
    { type: "APP", valueMHz: 119.9, name: "Kingsville Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KALM": [
    { type: "AWOS", valueMHz: 127.825, name: "AWOS" },
    { type: "APP", valueMHz: 120.6, name: "Holloman Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KALN": [
    { type: "ATIS", valueMHz: 128, name: "ATIS" },
    { type: "AWOS", valueMHz: 128, name: "AWOS" },
    { type: "DEL", valueMHz: 120.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 120.2, name: "Ground" },
    { type: "TWR", valueMHz: 126, name: "Tower" },
    { type: "APP", valueMHz: 124.2, name: "Approach" },
    { type: "CTAF", valueMHz: 126, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KALO": [
    { type: "ATIS", valueMHz: 120.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 118.9, name: "Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KALS": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KALW": [
    { type: "ASOS", valueMHz: 135.875, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 133.15, name: "Chinook Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" }
  ],
  "KAMA": [
    { type: "ATIS", valueMHz: 118.85, name: "ATIS" },
    { type: "DEL", valueMHz: 121.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 121.15, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KANB": [
    { type: "ASOS", valueMHz: 119.675, name: "ASOS" },
    { type: "APP", valueMHz: 125.45, name: "Birmingham Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KAND": [
    { type: "ASOS", valueMHz: 120.675, name: "ASOS" },
    { type: "APP", valueMHz: 118.8, name: "Greer Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAOO": [
    { type: "ASOS", valueMHz: 127.125, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KAPA": [
    { type: "ATIS", valueMHz: 120.3, name: "ATIS" },
    { type: "DEL", valueMHz: 128.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 132.75, name: "Denver Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAPF": [
    { type: "ATIS", valueMHz: 134.225, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 128.5, name: "Tower" },
    { type: "APP", valueMHz: 119.75, name: "Fort Myers Approach" },
    { type: "CTAF", valueMHz: 128.5, name: "CTAF" }
  ],
  "KAPG": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.15, name: "Tower" },
    { type: "APP", valueMHz: 126.75, name: "Potomac Approach" }
  ],
  "KAPN": [
    { type: "ASOS", valueMHz: 120.675, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.35, name: "Tower" },
    { type: "APP", valueMHz: 128.425, name: "Approach" },
    { type: "CTAF", valueMHz: 121.35, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KARA": [
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Lafayette Approach" },
    { type: "CTAF", valueMHz: 125, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KART": [
    { type: "ASOS", valueMHz: 133.525, name: "ASOS" },
    { type: "APP", valueMHz: 128.25, name: "Wheeler Sack Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KASE": [
    { type: "ATIS", valueMHz: 120.4, name: "ATIS" },
    { type: "DEL", valueMHz: 123.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.85, name: "Tower" },
    { type: "CTAF", valueMHz: 118.85, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAST": [
    { type: "ASOS", valueMHz: 135.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KATL": [
    { type: "ATIS", valueMHz: 119.65, name: "ATIS" },
    { type: "DEL", valueMHz: 118.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 127.9, name: "Atlanta Approach" },
    { type: "APP", valueMHz: 128, name: "Atlanta Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KATW": [
    { type: "ATIS", valueMHz: 127.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "APP", valueMHz: 126.3, name: "Green Bay Approach" },
    { type: "CTAF", valueMHz: 119.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KATY": [
    { type: "ASOS", valueMHz: 126.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KAUG": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "DEL", valueMHz: 119.95, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 128.35, name: "Portland Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KAUS": [
    { type: "ATIS", valueMHz: 124.4, name: "ATIS" },
    { type: "ASOS", valueMHz: 128.875, name: "ASOS" },
    { type: "DEL", valueMHz: 125.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 121, name: "Tower" },
    { type: "APP", valueMHz: 118.8, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAUW": [
    { type: "ASOS", valueMHz: 125.925, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KAVL": [
    { type: "ATIS", valueMHz: 120.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.1, name: "Tower" },
    { type: "APP", valueMHz: 124.65, name: "Approach" },
    { type: "CTAF", valueMHz: 121.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAVP": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 124.5, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KAWO": [
    { type: "AWOS", valueMHz: 135.625, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KAXN": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KAZO": [
    { type: "ATIS", valueMHz: 127.25, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBAB": [
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 125.4, name: "NorCal Approach" }
  ],
  "KBAD": [
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 128.25, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "Shreveport Approach" }
  ],
  "KBAF": [
    { type: "ATIS", valueMHz: 127.1, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.075, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Bradley Approach" },
    { type: "CTAF", valueMHz: 125.075, name: "CTAF" }
  ],
  "KBAK": [
    { type: "AWOS", valueMHz: 119.75, name: "AWOS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 134.85, name: "Indianapolis Approach" },
    { type: "CTAF", valueMHz: 118.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBAZ": [
    { type: "ASOS", valueMHz: 119.325, name: "ASOS" },
    { type: "DEL", valueMHz: 134.75, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 124.45, name: "San Antonio Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KBBD": [
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBCE": [
    { type: "ASOS", valueMHz: 135.475, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBCT": [
    { type: "AWOS", valueMHz: 121.125, name: "AWOS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.425, name: "Tower" },
    { type: "APP", valueMHz: 125.2, name: "Palm Beach Approach" },
    { type: "CTAF", valueMHz: 118.425, name: "CTAF" }
  ],
  "KBDE": [
    { type: "ASOS", valueMHz: 126.775, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBDL": [
    { type: "ATIS", valueMHz: 118.15, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 123.95, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBDR": [
    { type: "ATIS", valueMHz: 119.15, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 124.075, name: "New York Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBED": [
    { type: "ATIS", valueMHz: 124.6, name: "ATIS" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 124.4, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBFD": [
    { type: "ASOS", valueMHz: 133.825, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.075, name: "UNICOM" }
  ],
  "KBFF": [
    { type: "ASOS", valueMHz: 121.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBFI": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "DEL", valueMHz: 132.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "TWR", valueMHz: 120.6, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Seattle Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBFL": [
    { type: "ATIS", valueMHz: 118.6, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 118.8, name: "Bakersfield Approach" },
    { type: "APP", valueMHz: 118.9, name: "Bakersfield Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBFM": [
    { type: "ATIS", valueMHz: 135.575, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.8, name: "Tower" },
    { type: "APP", valueMHz: 118.5, name: "Approach" },
    { type: "CTAF", valueMHz: 118.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBGM": [
    { type: "ATIS", valueMHz: 128.15, name: "ATIS" },
    { type: "DEL", valueMHz: 125.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBGR": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 127.75, name: "ASOS" },
    { type: "DEL", valueMHz: 135.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 118.925, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBHB": [
    { type: "AWOS", valueMHz: 118.025, name: "AWOS" },
    { type: "DEL", valueMHz: 119.9, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 124.5, name: "Bangor Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBHM": [
    { type: "ATIS", valueMHz: 119.4, name: "ATIS" },
    { type: "DEL", valueMHz: 125.675, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBIF": [
    { type: "DEL", valueMHz: 125, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 127.9, name: "Tower" },
    { type: "APP", valueMHz: 119.15, name: "El Paso Approach" }
  ],
  "KBIH": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "APP", valueMHz: 125.75, name: "Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBIL": [
    { type: "ATIS", valueMHz: 126.3, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 124.2, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBIS": [
    { type: "ATIS", valueMHz: 119.35, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 126.3, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBIX": [
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.75, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Gulfport Approach" }
  ],
  "KBJC": [
    { type: "ATIS", valueMHz: 126.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 126.1, name: "Denver Approach" },
    { type: "CTAF", valueMHz: 118.6, name: "CTAF" }
  ],
  "KBJI": [
    { type: "AWOS", valueMHz: 119.275, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBKE": [
    { type: "ASOS", valueMHz: 134.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBKF": [
    { type: "ATIS", valueMHz: 119.675, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 121, name: "Tower" },
    { type: "APP", valueMHz: 128.45, name: "Denver Approach" }
  ],
  "KBKL": [
    { type: "ATIS", valueMHz: 125.25, name: "ATIS" },
    { type: "ASOS", valueMHz: 125.25, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Cleveland Approach" },
    { type: "CTAF", valueMHz: 124.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBKW": [
    { type: "ASOS", valueMHz: 121.55, name: "ASOS" },
    { type: "AWOS", valueMHz: 124.65, name: "AWOS" },
    { type: "APP", valueMHz: 118.95, name: "Charleston Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBLF": [
    { type: "ASOS", valueMHz: 132.725, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "KBLH": [
    { type: "ASOS", valueMHz: 120.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBLI": [
    { type: "ATIS", valueMHz: 134.45, name: "ATIS" },
    { type: "GND", valueMHz: 127.4, name: "Ground" },
    { type: "TWR", valueMHz: 124.9, name: "Tower" },
    { type: "APP", valueMHz: 132.7, name: "Victoria Approach" },
    { type: "CTAF", valueMHz: 124.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBLV": [
    { type: "ATIS", valueMHz: 128.7, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 119.2, name: "Ground" },
    { type: "TWR", valueMHz: 118.65, name: "Tower" },
    { type: "APP", valueMHz: 125.2, name: "St Louis Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBMG": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.775, name: "Tower" },
    { type: "APP", valueMHz: 128.025, name: "Hulman Approach" },
    { type: "CTAF", valueMHz: 120.775, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBMI": [
    { type: "ATIS", valueMHz: 135.35, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.35, name: "ASOS" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 124.6, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Peoria Approach" },
    { type: "CTAF", valueMHz: 124.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBNA": [
    { type: "ATIS", valueMHz: 135.1, name: "ATIS" },
    { type: "DEL", valueMHz: 126.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 120.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBNO": [
    { type: "ASOS", valueMHz: 135.575, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBOI": [
    { type: "ATIS", valueMHz: 123.9, name: "ATIS" },
    { type: "DEL", valueMHz: 125.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBOS": [
    { type: "ATIS", valueMHz: 135, name: "ATIS" },
    { type: "DEL", valueMHz: 121.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 128.8, name: "Tower" },
    { type: "TWR", valueMHz: 132.225, name: "Tower" },
    { type: "APP", valueMHz: 118.25, name: "Boston Approach" },
    { type: "APP", valueMHz: 120.6, name: "Boston Approach" },
    { type: "APP", valueMHz: 127.2, name: "Boston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBPI": [
    { type: "ASOS", valueMHz: 135.225, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBPK": [
    { type: "ASOS", valueMHz: 133.975, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBPT": [
    { type: "ATIS", valueMHz: 126.3, name: "ATIS" },
    { type: "DEL", valueMHz: 118.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 121.3, name: "Beaumont Approach" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBQK": [
    { type: "AWOS", valueMHz: 124.175, name: "AWOS" },
    { type: "DEL", valueMHz: 126.75, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KBRD": [
    { type: "ASOS", valueMHz: 126.775, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KBRL": [
    { type: "ASOS", valueMHz: 118.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBRO": [
    { type: "ATIS", valueMHz: 128.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Valley Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBTL": [
    { type: "ATIS", valueMHz: 128.325, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 126.825, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Kalamazoo Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBTM": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBTR": [
    { type: "ATIS", valueMHz: 125.2, name: "ATIS" },
    { type: "DEL", valueMHz: 119.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.45, name: "Tower" },
    { type: "APP", valueMHz: 120.3, name: "Approach" },
    { type: "CTAF", valueMHz: 118.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBTV": [
    { type: "ATIS", valueMHz: 123.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBUF": [
    { type: "ATIS", valueMHz: 135.35, name: "ATIS" },
    { type: "DEL", valueMHz: 124.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 133.2, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 126.15, name: "Buffalo Approach" }
  ],
  "KBUR": [
    { type: "ATIS", valueMHz: 134.5, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 123.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 120.4, name: "SoCal Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBVI": [
    { type: "ATIS", valueMHz: 118.35, name: "ATIS" },
    { type: "DEL", valueMHz: 124.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 124.75, name: "Pittsburgh Approach" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" }
  ],
  "KBVY": [
    { type: "ATIS", valueMHz: 119.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 125.2, name: "Tower" },
    { type: "APP", valueMHz: 124.4, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 125.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KBWG": [
    { type: "ASOS", valueMHz: 127.825, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KBWI": [
    { type: "ATIS", valueMHz: 123.8, name: "ATIS" },
    { type: "DEL", valueMHz: 118.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Potomac Approach" }
  ],
  "KBXM": [
    { type: "ATIS", valueMHz: 120.55, name: "ATIS" },
    { type: "DEL", valueMHz: 134.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 134.55, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "APP", valueMHz: 118.15, name: "Approach" }
  ],
  "KBYH": [
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KBYI": [
    { type: "ASOS", valueMHz: 135.575, name: "ASOS" },
    { type: "APP", valueMHz: 126.7, name: "Twin Falls Approach" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "KBZN": [
    { type: "ATIS", valueMHz: 135.425, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCAE": [
    { type: "ATIS", valueMHz: 120.15, name: "ATIS" },
    { type: "DEL", valueMHz: 119.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 124.15, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCAK": [
    { type: "ATIS", valueMHz: 121.05, name: "ATIS" },
    { type: "DEL", valueMHz: 132.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCAR": [
    { type: "ASOS", valueMHz: 135.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCBM": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 128.65, name: "Tower" },
    { type: "APP", valueMHz: 126.075, name: "Approach" }
  ],
  "KCCR": [
    { type: "ATIS", valueMHz: 124.7, name: "ATIS" },
    { type: "DEL", valueMHz: 118.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.7, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 119.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCCY": [
    { type: "AWOS", valueMHz: 125.525, name: "AWOS" },
    { type: "APP", valueMHz: 118.9, name: "Waterloo Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCDC": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCDR": [
    { type: "ASOS", valueMHz: 118.05, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCDS": [
    { type: "ASOS", valueMHz: 135.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCEC": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCEF": [
    { type: "GND", valueMHz: 118.35, name: "Ground" },
    { type: "TWR", valueMHz: 134.85, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Bradley Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCEW": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "APP", valueMHz: 124.05, name: "Eglin Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCEZ": [
    { type: "ASOS", valueMHz: 135.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCGF": [
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Cleveland Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCGI": [
    { type: "ASOS", valueMHz: 120.55, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119, name: "Tower" },
    { type: "CTAF", valueMHz: 119, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCHA": [
    { type: "ATIS", valueMHz: 119.85, name: "ATIS" },
    { type: "DEL", valueMHz: 120.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Chattanooga Approach" },
    { type: "APP", valueMHz: 122.5, name: "Chattanooga Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCHO": [
    { type: "ATIS", valueMHz: 118.425, name: "ATIS" },
    { type: "ASOS", valueMHz: 118.425, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 124.5, name: "Tower" },
    { type: "APP", valueMHz: 132.85, name: "Potomac Approach" },
    { type: "CTAF", valueMHz: 124.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCHS": [
    { type: "ATIS", valueMHz: 124.75, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126, name: "Tower" },
    { type: "APP", valueMHz: 119.3, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCID": [
    { type: "ATIS", valueMHz: 124.15, name: "ATIS" },
    { type: "DEL", valueMHz: 125.45, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Approach" },
    { type: "APP", valueMHz: 134.05, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCIU": [
    { type: "AWOS", valueMHz: 127.575, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCKB": [
    { type: "ATIS", valueMHz: 127.825, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.7, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Clarksburg Approach" },
    { type: "CTAF", valueMHz: 126.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCLE": [
    { type: "ATIS", valueMHz: 127.85, name: "ATIS" },
    { type: "DEL", valueMHz: 125.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 119.625, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCLL": [
    { type: "ATIS", valueMHz: 126.85, name: "ATIS" },
    { type: "GND", valueMHz: 128.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCLM": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "DEL", valueMHz: 124.15, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 118.2, name: "Whidbey Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCLT": [
    { type: "ATIS", valueMHz: 121.15, name: "ATIS" },
    { type: "DEL", valueMHz: 127.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCMA": [
    { type: "ATIS", valueMHz: 126.025, name: "ATIS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 128.2, name: "Tower" },
    { type: "APP", valueMHz: 124.7, name: "Pt Mugu Approach" },
    { type: "CTAF", valueMHz: 128.2, name: "CTAF" }
  ],
  "KCMH": [
    { type: "ATIS", valueMHz: 124.6, name: "ATIS" },
    { type: "DEL", valueMHz: 126.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 132.7, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Columbus Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCMI": [
    { type: "ATIS", valueMHz: 124.85, name: "ATIS" },
    { type: "DEL", valueMHz: 128.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.25, name: "Tower" },
    { type: "APP", valueMHz: 121.35, name: "Champaign Approach" },
    { type: "CTAF", valueMHz: 120.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCMX": [
    { type: "ASOS", valueMHz: 125.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KCNM": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCNU": [
    { type: "ASOS", valueMHz: 127.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KCNY": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCOD": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCOE": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "APP", valueMHz: 132.1, name: "Spokane Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCOF": [
    { type: "ATIS", valueMHz: 119.175, name: "ATIS" },
    { type: "DEL", valueMHz: 118.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 124.35, name: "Ground" },
    { type: "TWR", valueMHz: 133.75, name: "Tower" },
    { type: "APP", valueMHz: 132.65, name: "Orlando Approach" }
  ],
  "KCON": [
    { type: "ASOS", valueMHz: 132.32, name: "ASOS" },
    { type: "DEL", valueMHz: 133.65, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 127.35, name: "Boston Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KCOS": [
    { type: "ATIS", valueMHz: 125, name: "ATIS" },
    { type: "DEL", valueMHz: 134.45, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118.5, name: "Springs Approach" },
    { type: "CTAF", valueMHz: 124.15, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCOU": [
    { type: "ATIS", valueMHz: 128.45, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 124.375, name: "Mizzu Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCPR": [
    { type: "ATIS", valueMHz: 126.15, name: "ATIS" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Casper Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCRE": [
    { type: "ATIS", valueMHz: 119.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.6, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Myrtle Beach Approach" },
    { type: "CTAF", valueMHz: 124.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCRG": [
    { type: "ATIS", valueMHz: 125.4, name: "ATIS" },
    { type: "DEL", valueMHz: 118.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 132.1, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Jacksonville Approach" },
    { type: "CTAF", valueMHz: 132.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCRP": [
    { type: "ATIS", valueMHz: 126.8, name: "ATIS" },
    { type: "DEL", valueMHz: 118.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 120.9, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCRQ": [
    { type: "ATIS", valueMHz: 120.15, name: "ATIS" },
    { type: "DEL", valueMHz: 134.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 127.3, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 118.6, name: "CTAF" }
  ],
  "KCRW": [
    { type: "ATIS", valueMHz: 127.6, name: "ATIS" },
    { type: "DEL", valueMHz: 118.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 125.7, name: "Tower" },
    { type: "APP", valueMHz: 128.5, name: "Charleston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCSG": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCSV": [
    { type: "ASOS", valueMHz: 120.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KCTB": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCUB": [
    { type: "ASOS", valueMHz: 119.675, name: "ASOS" },
    { type: "DEL", valueMHz: 124.4, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 133.4, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCVG": [
    { type: "ATIS", valueMHz: 134.375, name: "ATIS" },
    { type: "ATIS", valueMHz: 135.3, name: "ATIS" },
    { type: "DEL", valueMHz: 127.175, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "TWR", valueMHz: 118.975, name: "Tower" },
    { type: "TWR", valueMHz: 133.325, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Cincinnati Approach" },
    { type: "APP", valueMHz: 123.875, name: "Cincinnati Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCVN": [
    { type: "AWOS", valueMHz: 135.375, name: "AWOS" },
    { type: "DEL", valueMHz: 119, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 125.5, name: "Cannon Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KCVO": [
    { type: "AWOS", valueMHz: 135.775, name: "AWOS" },
    { type: "APP", valueMHz: 127.5, name: "Cascade Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCVS": [
    { type: "ATIS", valueMHz: 119.1, name: "ATIS" },
    { type: "DEL", valueMHz: 120.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.4, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Approach" }
  ],
  "KCWA": [
    { type: "ATIS", valueMHz: 127.45, name: "ATIS" },
    { type: "AWOS", valueMHz: 127.45, name: "AWOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.75, name: "Tower" },
    { type: "CTAF", valueMHz: 119.75, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCXO": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "DEL", valueMHz: 119.55, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 119.7, name: "Houston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KCXP": [
    { type: "AWOS", valueMHz: 119.925, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KCYS": [
    { type: "ATIS", valueMHz: 134.425, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 124.55, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDAA": [
    { type: "ATIS", valueMHz: 128.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "APP", valueMHz: 119.85, name: "Potomac Approach" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" }
  ],
  "KDAB": [
    { type: "ATIS", valueMHz: 132.875, name: "ATIS" },
    { type: "DEL", valueMHz: 119.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 118.85, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDAG": [
    { type: "ASOS", valueMHz: 132.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KDAL": [
    { type: "ATIS", valueMHz: 120.15, name: "ATIS" },
    { type: "DEL", valueMHz: 127.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "Dallas Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDAN": [
    { type: "ASOS", valueMHz: 128.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KDAY": [
    { type: "ATIS", valueMHz: 125.8, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "Dayton Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDBQ": [
    { type: "ATIS", valueMHz: 127.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDCA": [
    { type: "DEL", valueMHz: 128.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "TWR", valueMHz: 134.35, name: "Tower" },
    { type: "APP", valueMHz: 119.85, name: "Potomac Approach" },
    { type: "APP", valueMHz: 124.2, name: "Potomac Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDDC": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KDEC": [
    { type: "ATIS", valueMHz: 126.35, name: "ATIS" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 132.85, name: "Champaign Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDEN": [
    { type: "ATIS", valueMHz: 125.6, name: "ATIS" },
    { type: "DEL", valueMHz: 118.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 119.3, name: "Denver Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDET": [
    { type: "ATIS", valueMHz: 124.875, name: "ATIS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 126.85, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDFW": [
    { type: "ATIS", valueMHz: 123.775, name: "ATIS" },
    { type: "DEL", valueMHz: 128.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 124.15, name: "Tower" },
    { type: "APP", valueMHz: 119.875, name: "Dallas Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDHN": [
    { type: "ATIS", valueMHz: 135.72, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 125.4, name: "Cairns Approach" },
    { type: "CTAF", valueMHz: 118.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDHT": [
    { type: "ASOS", valueMHz: 134.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDIK": [
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KDLF": [
    { type: "DEL", valueMHz: 120.5, name: "Clearance Delivery" },
    { type: "TWR", valueMHz: 125.2, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Del Rio Approach" }
  ],
  "KDLH": [
    { type: "ATIS", valueMHz: 124.1, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.45, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDLS": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KDMA": [
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.85, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Tucson Approach" }
  ],
  "KDMN": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDNL": [
    { type: "ASOS", valueMHz: 135.275, name: "ASOS" },
    { type: "DEL", valueMHz: 128.1, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 126.8, name: "Augusta Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KDOV": [
    { type: "ATIS", valueMHz: 135.05, name: "ATIS" },
    { type: "DEL", valueMHz: 125.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118.875, name: "Ground" },
    { type: "TWR", valueMHz: 126.35, name: "Tower" },
    { type: "APP", valueMHz: 132.425, name: "Approach" }
  ],
  "KDPA": [
    { type: "ATIS", valueMHz: 124.8, name: "ATIS" },
    { type: "ASOS", valueMHz: 124.8, name: "ASOS" },
    { type: "DEL", valueMHz: 119.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 133.5, name: "Chicago Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDRA": [
    { type: "ASOS", valueMHz: 119.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDRI": [
    { type: "AWOS", valueMHz: 118.225, name: "AWOS" },
    { type: "APP", valueMHz: 123.7, name: "Polk Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDRO": [
    { type: "ASOS", valueMHz: 120.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDRT": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "DEL", valueMHz: 120.5, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 119.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDSM": [
    { type: "ATIS", valueMHz: 119.55, name: "ATIS" },
    { type: "DEL", valueMHz: 134.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDTS": [
    { type: "ASOS", valueMHz: 133.925, name: "ASOS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 132.1, name: "Eglin Approach" },
    { type: "UNICOM", valueMHz: 123.075, name: "UNICOM" }
  ],
  "KDTW": [
    { type: "ATIS", valueMHz: 133.675, name: "ATIS" },
    { type: "DEL", valueMHz: 120.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 119.25, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 118.575, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDUA": [
    { type: "AWOS", valueMHz: 124.175, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDUG": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KDUJ": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "CTAF", valueMHz: 123, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KDVL": [
    { type: "AWOS", valueMHz: 125.875, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KDXR": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 127.75, name: "ASOS" },
    { type: "DEL", valueMHz: 128.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 126.4, name: "New York Approach" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KDYS": [
    { type: "GND", valueMHz: 118.35, name: "Ground" },
    { type: "TWR", valueMHz: 133, name: "Tower" },
    { type: "APP", valueMHz: 125, name: "Abilene Approach" }
  ],
  "KEAR": [
    { type: "AWOS", valueMHz: 123.875, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KEAT": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KEAU": [
    { type: "ASOS", valueMHz: 119.675, name: "ASOS" },
    { type: "APP", valueMHz: 125.3, name: "Minneapolis Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KECG": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 119.55, name: "Norfolk Approach" },
    { type: "CTAF", valueMHz: 120.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KECP": [
    { type: "ATIS", valueMHz: 119.975, name: "ATIS" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 118.95, name: "Tower" },
    { type: "CTAF", valueMHz: 118.95, name: "CTAF" }
  ],
  "KEDW": [
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 132.75, name: "Sport Approach" }
  ],
  "KEED": [
    { type: "ASOS", valueMHz: 128.325, name: "ASOS" },
    { type: "APP", valueMHz: 134.65, name: "Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KEEN": [
    { type: "AWOS", valueMHz: 119.025, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KEET": [
    { type: "ASOS", valueMHz: 134.325, name: "ASOS" },
    { type: "APP", valueMHz: 123.8, name: "Birmingham Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KEFD": [
    { type: "ATIS", valueMHz: 135.575, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 126.05, name: "Tower" },
    { type: "APP", valueMHz: 134.45, name: "Houston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KEGE": [
    { type: "ATIS", valueMHz: 135.575, name: "ATIS" },
    { type: "AWOS", valueMHz: 135.575, name: "AWOS" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" }
  ],
  "KEGI": [
    { type: "TWR", valueMHz: 133.2, name: "Tower" },
    { type: "APP", valueMHz: 125.1, name: "Approach" }
  ],
  "KEKA": [
    { type: "APP", valueMHz: 124.85, name: "Seattle Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KEKN": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "APP", valueMHz: 121.15, name: "Clarksburg Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "KEKO": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "CTAF", valueMHz: 123, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KELD": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "APP", valueMHz: 126.32, name: "Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KELM": [
    { type: "ATIS", valueMHz: 125.475, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.1, name: "Tower" },
    { type: "APP", valueMHz: 119.45, name: "Approach" },
    { type: "CTAF", valueMHz: 122.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KELO": [
    { type: "AWOS", valueMHz: 132.025, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KELP": [
    { type: "ATIS", valueMHz: 120, name: "ATIS" },
    { type: "DEL", valueMHz: 125, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.15, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KELY": [
    { type: "ASOS", valueMHz: 120.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KEND": [
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.05, name: "Tower" },
    { type: "APP", valueMHz: 118.075, name: "Approach" }
  ],
  "KENV": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KENW": [
    { type: "ATIS", valueMHz: 127.175, name: "ATIS" },
    { type: "ASOS", valueMHz: 127.175, name: "ASOS" },
    { type: "DEL", valueMHz: 118.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.875, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 120.15, name: "Milwaukee Approach" },
    { type: "CTAF", valueMHz: 118.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KERI": [
    { type: "ATIS", valueMHz: 120.35, name: "ATIS" },
    { type: "DEL", valueMHz: 126.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KESC": [
    { type: "AWOS", valueMHz: 121.425, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KESF": [
    { type: "APP", valueMHz: 132.05, name: "Polk Approach" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "KEUG": [
    { type: "ATIS", valueMHz: 125.225, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Cascade Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KEVV": [
    { type: "ATIS", valueMHz: 120.2, name: "ATIS" },
    { type: "DEL", valueMHz: 126.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 124.025, name: "Approach" },
    { type: "APP", valueMHz: 127.35, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KEVW": [
    { type: "ASOS", valueMHz: 120, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KEWB": [
    { type: "ATIS", valueMHz: 126.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 128.7, name: "Providence Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KEWN": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "DEL", valueMHz: 120.525, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.25, name: "Tower" },
    { type: "APP", valueMHz: 119.35, name: "Cherry Point Approach" },
    { type: "CTAF", valueMHz: 124.25, name: "CTAF" }
  ],
  "KEWR": [
    { type: "DEL", valueMHz: 118.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 127.6, name: "New York Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KEYW": [
    { type: "ATIS", valueMHz: 119.675, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.65, name: "ASOS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 124.45, name: "Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFAF": [
    { type: "GND", valueMHz: 121.35, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "APP", valueMHz: 125.7, name: "Norfolk Approach" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" }
  ],
  "KFAR": [
    { type: "ATIS", valueMHz: 124.5, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 133.8, name: "Tower" },
    { type: "APP", valueMHz: 120.4, name: "Fargo Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFAT": [
    { type: "ATIS", valueMHz: 121.35, name: "ATIS" },
    { type: "DEL", valueMHz: 124.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 118.5, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFAY": [
    { type: "ATIS", valueMHz: 121.25, name: "ATIS" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.175, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFBG": [
    { type: "TWR", valueMHz: 125.9, name: "Tower" },
    { type: "APP", valueMHz: 133, name: "Fayetteville Approach" }
  ],
  "KFCS": [
    { type: "TWR", valueMHz: 125.5, name: "Tower" },
    { type: "APP", valueMHz: 124, name: "Springs Approach" }
  ],
  "KFDY": [
    { type: "ASOS", valueMHz: 124.425, name: "ASOS" },
    { type: "APP", valueMHz: 120.8, name: "Toledo Approach" },
    { type: "UNICOM", valueMHz: 122.725, name: "UNICOM" }
  ],
  "KFFO": [
    { type: "ATIS", valueMHz: 124.475, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 126.9, name: "Tower" },
    { type: "APP", valueMHz: 118.85, name: "Dayton Approach" }
  ],
  "KFHR": [
    { type: "ASOS", valueMHz: 135.675, name: "ASOS" },
    { type: "APP", valueMHz: 118.2, name: "Whidbey Approach" },
    { type: "CTAF", valueMHz: 128.25, name: "CTAF" }
  ],
  "KFHU": [
    { type: "ATIS", valueMHz: 134.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.675, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.95, name: "Tower" },
    { type: "CTAF", valueMHz: 124.95, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFKL": [
    { type: "AWOS", valueMHz: 118.175, name: "AWOS" },
    { type: "DEL", valueMHz: 126.25, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 133.95, name: "Youngstown Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KFLG": [
    { type: "ATIS", valueMHz: 125.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 134.55, name: "Tower" },
    { type: "CTAF", valueMHz: 134.55, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFLL": [
    { type: "ATIS", valueMHz: 135, name: "ATIS" },
    { type: "DEL", valueMHz: 128.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.4, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Miami Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFLO": [
    { type: "ATIS", valueMHz: 123.625, name: "ATIS" },
    { type: "TWR", valueMHz: 125.1, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "CTAF", valueMHz: 125.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFME": [
    { type: "AWOS", valueMHz: 123.925, name: "AWOS" },
    { type: "APP", valueMHz: 119.7, name: "Potomac Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KFMN": [
    { type: "ATIS", valueMHz: 127.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFMY": [
    { type: "ATIS", valueMHz: 123.725, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119, name: "Tower" },
    { type: "APP", valueMHz: 126.8, name: "Fort Myers Approach" },
    { type: "CTAF", valueMHz: 119, name: "CTAF" },
    { type: "UNICOM", valueMHz: 130.55, name: "UNICOM" }
  ],
  "KFNL": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "DEL", valueMHz: 120.25, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 134.85, name: "Denver Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KFNT": [
    { type: "ATIS", valueMHz: 133.15, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "APP", valueMHz: 118.8, name: "Flint Approach" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFOD": [
    { type: "AWOS", valueMHz: 118.775, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFOE": [
    { type: "ATIS", valueMHz: 128.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.8, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Approach" },
    { type: "CTAF", valueMHz: 120.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFPR": [
    { type: "ATIS", valueMHz: 134.825, name: "ATIS" },
    { type: "GND", valueMHz: 119.55, name: "Ground" },
    { type: "TWR", valueMHz: 128.2, name: "Tower" },
    { type: "CTAF", valueMHz: 128.2, name: "CTAF" }
  ],
  "KFRG": [
    { type: "ATIS", valueMHz: 126.65, name: "ATIS" },
    { type: "DEL", valueMHz: 128.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 118.8, name: "Tower" },
    { type: "APP", valueMHz: 118.4, name: "New York Approach" },
    { type: "CTAF", valueMHz: 118.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFRI": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "CTAF", valueMHz: 126.2, name: "CTAF" }
  ],
  "KFSD": [
    { type: "ATIS", valueMHz: 126.6, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.8, name: "Sioux Falls Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFSI": [
    { type: "ATIS", valueMHz: 135.425, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.95, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Fort Sill Approach" }
  ],
  "KFSM": [
    { type: "ATIS", valueMHz: 126.3, name: "ATIS" },
    { type: "DEL", valueMHz: 133.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 120.175, name: "Razorback Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFST": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KFTK": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.8, name: "Tower" },
    { type: "APP", valueMHz: 123.675, name: "Louisville Approach" },
    { type: "CTAF", valueMHz: 126.8, name: "CTAF" }
  ],
  "KFTW": [
    { type: "ATIS", valueMHz: 120.7, name: "ATIS" },
    { type: "DEL", valueMHz: 124.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Regional Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFTY": [
    { type: "ATIS", valueMHz: 120.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.45, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 118.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFWA": [
    { type: "ATIS", valueMHz: 121.25, name: "ATIS" },
    { type: "DEL", valueMHz: 124.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 127.2, name: "Approach" },
    { type: "APP", valueMHz: 132.15, name: "Approach" },
    { type: "APP", valueMHz: 135.325, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFXE": [
    { type: "ATIS", valueMHz: 119.85, name: "ATIS" },
    { type: "DEL", valueMHz: 127.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Miami Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KFYV": [
    { type: "ATIS", valueMHz: 133.1, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 128, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Razorback Approach" },
    { type: "CTAF", valueMHz: 128, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGCC": [
    { type: "ASOS", valueMHz: 124.175, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGCK": [
    { type: "ASOS", valueMHz: 121.325, name: "ASOS" },
    { type: "GND", valueMHz: 119, name: "Ground" },
    { type: "TWR", valueMHz: 118.15, name: "Tower" },
    { type: "CTAF", valueMHz: 118.15, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGCN": [
    { type: "ATIS", valueMHz: 124.3, name: "ATIS" },
    { type: "ASOS", valueMHz: 124.3, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119, name: "Tower" },
    { type: "CTAF", valueMHz: 119, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGDV": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KGEG": [
    { type: "ATIS", valueMHz: 124.325, name: "ATIS" },
    { type: "DEL", valueMHz: 127.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 123.75, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGFK": [
    { type: "ATIS", valueMHz: 119.4, name: "ATIS" },
    { type: "GND", valueMHz: 124.575, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Approach" },
    { type: "CTAF", valueMHz: 118.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGFL": [
    { type: "ASOS", valueMHz: 119.25, name: "ASOS" },
    { type: "APP", valueMHz: 125, name: "Albany Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KGGG": [
    { type: "ATIS", valueMHz: 119.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.2, name: "Tower" },
    { type: "APP", valueMHz: 118.25, name: "Longview Approach" },
    { type: "CTAF", valueMHz: 119.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGGW": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KGJT": [
    { type: "ATIS", valueMHz: 118.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Denver Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGLD": [
    { type: "ASOS", valueMHz: 121.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGLH": [
    { type: "ASOS", valueMHz: 125.525, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119, name: "Tower" },
    { type: "CTAF", valueMHz: 119, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGLS": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "DEL", valueMHz: 135.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118.625, name: "Ground" },
    { type: "TWR", valueMHz: 120.575, name: "Tower" },
    { type: "APP", valueMHz: 134.45, name: "Houston Approach" },
    { type: "CTAF", valueMHz: 120.575, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KGMU": [
    { type: "ASOS", valueMHz: 127.075, name: "ASOS" },
    { type: "GND", valueMHz: 121.25, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118.8, name: "Greer Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGNV": [
    { type: "ATIS", valueMHz: 127.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.55, name: "Tower" },
    { type: "APP", valueMHz: 118.175, name: "Jacksonville Approach" },
    { type: "CTAF", valueMHz: 119.55, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGON": [
    { type: "ATIS", valueMHz: 127, name: "ATIS" },
    { type: "DEL", valueMHz: 119.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 125.6, name: "Tower" },
    { type: "APP", valueMHz: 125.75, name: "Providence Approach" },
    { type: "CTAF", valueMHz: 125.6, name: "CTAF" }
  ],
  "KGPI": [
    { type: "ATIS", valueMHz: 132.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 124.55, name: "Tower" },
    { type: "CTAF", valueMHz: 124.55, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGPT": [
    { type: "ATIS", valueMHz: 119.45, name: "ATIS" },
    { type: "GND", valueMHz: 120.4, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Approach" },
    { type: "CTAF", valueMHz: 123.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGRB": [
    { type: "ATIS", valueMHz: 124.1, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Green Bay Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGRF": [
    { type: "ATIS", valueMHz: 124.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.325, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "Seattle Approach" },
    { type: "CTAF", valueMHz: 119.325, name: "CTAF" }
  ],
  "KGRI": [
    { type: "ATIS", valueMHz: 127.4, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGRK": [
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 126.2, name: "Ground" },
    { type: "TWR", valueMHz: 120.75, name: "Tower" },
    { type: "APP", valueMHz: 120.075, name: "Gray Approach" }
  ],
  "KGRR": [
    { type: "ATIS", valueMHz: 118.725, name: "ATIS" },
    { type: "DEL", valueMHz: 119.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 135.65, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Grand Rapids Approach" },
    { type: "APP", valueMHz: 128.4, name: "Grand Rapids Approach" },
    { type: "CTAF", valueMHz: 135.65, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGSB": [
    { type: "DEL", valueMHz: 128.025, name: "Clearance Delivery" },
    { type: "TWR", valueMHz: 126.25, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Approach" }
  ],
  "KGSO": [
    { type: "ATIS", valueMHz: 128.55, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 118.5, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGSP": [
    { type: "ATIS", valueMHz: 134.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 120.6, name: "Greer Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGTB": [
    { type: "ATIS", valueMHz: 126.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.75, name: "Tower" },
    { type: "APP", valueMHz: 128.25, name: "Approach" }
  ],
  "KGTF": [
    { type: "ATIS", valueMHz: 126.6, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 128.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGTR": [
    { type: "ATIS", valueMHz: 126.375, name: "ATIS" },
    { type: "AWOS", valueMHz: 126.375, name: "AWOS" },
    { type: "DEL", valueMHz: 126.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 135.375, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 135.6, name: "Columbus Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KGUC": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KGUP": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGUS": [
    { type: "DEL", valueMHz: 128.425, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.425, name: "Ground" },
    { type: "TWR", valueMHz: 133.7, name: "Tower" },
    { type: "APP", valueMHz: 121.05, name: "Approach" },
    { type: "APP", valueMHz: 123.85, name: "Approach" },
    { type: "APP", valueMHz: 135.35, name: "Approach" }
  ],
  "KGUY": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KGWO": [
    { type: "ASOS", valueMHz: 119.975, name: "ASOS" },
    { type: "DEL", valueMHz: 125.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 125.55, name: "Ground" },
    { type: "TWR", valueMHz: 118.35, name: "Tower" },
    { type: "CTAF", valueMHz: 118.35, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KGYI": [
    { type: "AWOS", valueMHz: 118.775, name: "AWOS" },
    { type: "APP", valueMHz: 124.75, name: "Fort Worth Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KGYY": [
    { type: "ATIS", valueMHz: 120.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 125.6, name: "Tower" },
    { type: "APP", valueMHz: 133.1, name: "Chicago Approach" },
    { type: "CTAF", valueMHz: 125.6, name: "CTAF" }
  ],
  "KHBG": [
    { type: "ASOS", valueMHz: 135.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHBR": [
    { type: "ASOS", valueMHz: 133.325, name: "ASOS" },
    { type: "APP", valueMHz: 125.1, name: "Altus Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHDN": [
    { type: "AWOS", valueMHz: 119.275, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHEF": [
    { type: "ATIS", valueMHz: 125.175, name: "ATIS" },
    { type: "AWOS", valueMHz: 120.35, name: "AWOS" },
    { type: "DEL", valueMHz: 120.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 133.1, name: "Tower" },
    { type: "APP", valueMHz: 128.525, name: "Potomac Approach" },
    { type: "CTAF", valueMHz: 133.1, name: "CTAF" }
  ],
  "KHFD": [
    { type: "ATIS", valueMHz: 126.45, name: "ATIS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "APP", valueMHz: 127.8, name: "Bradley Approach" },
    { type: "CTAF", valueMHz: 119.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHGR": [
    { type: "ASOS", valueMHz: 126.375, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHHR": [
    { type: "ATIS", valueMHz: 118.4, name: "ATIS" },
    { type: "GND", valueMHz: 125.1, name: "Ground" },
    { type: "TWR", valueMHz: 121.1, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 121.1, name: "CTAF" }
  ],
  "KHIB": [
    { type: "ASOS", valueMHz: 126.425, name: "ASOS" },
    { type: "DEL", valueMHz: 127.4, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 125.45, name: "Duluth Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHIF": [
    { type: "ATIS", valueMHz: 134.925, name: "ATIS" },
    { type: "DEL", valueMHz: 124.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 127.15, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Salt Lake City Approach" }
  ],
  "KHII": [
    { type: "AWOS", valueMHz: 119.025, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KHIO": [
    { type: "ATIS", valueMHz: 127.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 126, name: "Portland Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHKY": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 128.15, name: "Tower" },
    { type: "CTAF", valueMHz: 128.15, name: "CTAF" }
  ],
  "KHLG": [
    { type: "ASOS", valueMHz: 127.375, name: "ASOS" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 118.65, name: "Pittsburg Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHLN": [
    { type: "ATIS", valueMHz: 120.4, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHMN": [
    { type: "DEL", valueMHz: 126.7, name: "Clearance Delivery" },
    { type: "DEL", valueMHz: 126.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 127.05, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 120.6, name: "Approach" }
  ],
  "KHOB": [
    { type: "ATIS", valueMHz: 119.75, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.65, name: "Tower" },
    { type: "CTAF", valueMHz: 120.65, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHON": [
    { type: "ASOS", valueMHz: 118.125, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHOP": [
    { type: "ATIS", valueMHz: 125.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Approach" }
  ],
  "KHOT": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "APP", valueMHz: 127.825, name: "Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHOU": [
    { type: "ATIS", valueMHz: 124.6, name: "ATIS" },
    { type: "DEL", valueMHz: 125.45, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "Houston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHPN": [
    { type: "ATIS", valueMHz: 133.8, name: "ATIS" },
    { type: "DEL", valueMHz: 127.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.825, name: "Ground" },
    { type: "TWR", valueMHz: 118.575, name: "Tower" },
    { type: "APP", valueMHz: 120.8, name: "New York Approach" },
    { type: "CTAF", valueMHz: 118.575, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHQM": [
    { type: "ASOS", valueMHz: 135.775, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KHRL": [
    { type: "ATIS", valueMHz: 124.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 120.7, name: "Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHRO": [
    { type: "ASOS", valueMHz: 121.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHRT": [
    { type: "GND", valueMHz: 123.975, name: "Ground" },
    { type: "TWR", valueMHz: 126.5, name: "Tower" },
    { type: "APP", valueMHz: 133, name: "Eglin Approach" }
  ],
  "KHST": [
    { type: "ATIS", valueMHz: 132.275, name: "ATIS" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 133.45, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Approach" }
  ],
  "KHSV": [
    { type: "ATIS", valueMHz: 121.25, name: "ATIS" },
    { type: "DEL", valueMHz: 120.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.6, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Approach" },
    { type: "CTAF", valueMHz: 127.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHTS": [
    { type: "ATIS", valueMHz: 125.2, name: "ATIS" },
    { type: "DEL", valueMHz: 118.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 119.75, name: "Huntington Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHUA": [
    { type: "TWR", valueMHz: 126.95, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Huntsville Approach" },
    { type: "CTAF", valueMHz: 126.95, name: "CTAF" }
  ],
  "KHUF": [
    { type: "ATIS", valueMHz: 127.5, name: "ATIS" },
    { type: "ASOS", valueMHz: 127.5, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 134.725, name: "Tower" },
    { type: "APP", valueMHz: 119.8, name: "Approach" },
    { type: "APP", valueMHz: 125.45, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHUL": [
    { type: "ASOS", valueMHz: 132.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHUT": [
    { type: "ATIS", valueMHz: 124.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Wichita Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHVN": [
    { type: "ATIS", valueMHz: 133.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.8, name: "Tower" },
    { type: "APP", valueMHz: 124.075, name: "New York Approach" },
    { type: "CTAF", valueMHz: 124.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHVR": [
    { type: "ASOS", valueMHz: 135.225, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHWO": [
    { type: "ATIS", valueMHz: 135.475, name: "ATIS" },
    { type: "GND", valueMHz: 120.45, name: "Ground" },
    { type: "TWR", valueMHz: 132.1, name: "Tower" },
    { type: "APP", valueMHz: 128.6, name: "Miami Approach" },
    { type: "CTAF", valueMHz: 132.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHXD": [
    { type: "ATIS", valueMHz: 121.4, name: "ATIS" },
    { type: "DEL", valueMHz: 121.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.1, name: "Ground" },
    { type: "TWR", valueMHz: 118.975, name: "Tower" },
    { type: "APP", valueMHz: 125.3, name: "Savannah Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KHYA": [
    { type: "ATIS", valueMHz: 123.8, name: "ATIS" },
    { type: "DEL", valueMHz: 125.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Cape Approach" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KHYI": [
    { type: "AWOS", valueMHz: 120.825, name: "AWOS" },
    { type: "DEL", valueMHz: 121.35, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 119, name: "Austin Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KHYR": [
    { type: "APP", valueMHz: 126.45, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHYS": [
    { type: "AWOS", valueMHz: 125.525, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KHZY": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "APP", valueMHz: 121, name: "Erie Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KIAB": [
    { type: "ATIS", valueMHz: 124.65, name: "ATIS" },
    { type: "GND", valueMHz: 118, name: "Ground" },
    { type: "TWR", valueMHz: 127.25, name: "Tower" },
    { type: "APP", valueMHz: 120.6, name: "Wichita Approach" }
  ],
  "KIAD": [
    { type: "ATIS", valueMHz: 134.85, name: "ATIS" },
    { type: "DEL", valueMHz: 135.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 120.45, name: "Potomac Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIAG": [
    { type: "ATIS", valueMHz: 120.8, name: "ATIS" },
    { type: "DEL", valueMHz: 119.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 126.5, name: "Buffalo Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIAH": [
    { type: "ATIS", valueMHz: 124.05, name: "ATIS" },
    { type: "DEL", valueMHz: 128.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118.575, name: "Ground" },
    { type: "TWR", valueMHz: 120.725, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KICT": [
    { type: "ATIS", valueMHz: 125.15, name: "ATIS" },
    { type: "DEL", valueMHz: 125.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIDA": [
    { type: "ATIS", valueMHz: 135.325, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.325, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIFP": [
    { type: "DEL", valueMHz: 118.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118.25, name: "Ground" },
    { type: "TWR", valueMHz: 123.9, name: "Tower" },
    { type: "CTAF", valueMHz: 123.9, name: "CTAF" }
  ],
  "KIGM": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KIKK": [
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KILG": [
    { type: "ATIS", valueMHz: 123.95, name: "ATIS" },
    { type: "DEL", valueMHz: 119.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 126, name: "Tower" },
    { type: "APP", valueMHz: 118.35, name: "Philadelphia Approach" },
    { type: "CTAF", valueMHz: 126, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KILM": [
    { type: "ATIS", valueMHz: 124.975, name: "ATIS" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118.25, name: "Wilmington Approach" },
    { type: "APP", valueMHz: 135.75, name: "Wilmington Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KILN": [
    { type: "ATIS", valueMHz: 124.925, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.675, name: "ASOS" },
    { type: "DEL", valueMHz: 125.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.475, name: "Tower" },
    { type: "APP", valueMHz: 118.85, name: "Dayton Approach" },
    { type: "CTAF", valueMHz: 119.475, name: "CTAF" }
  ],
  "KIMT": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KIND": [
    { type: "ATIS", valueMHz: 134.25, name: "ATIS" },
    { type: "DEL", valueMHz: 128.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 128.175, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KINK": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KINL": [
    { type: "ASOS", valueMHz: 120, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KINT": [
    { type: "ATIS", valueMHz: 121.3, name: "ATIS" },
    { type: "GND", valueMHz: 128.25, name: "Ground" },
    { type: "TWR", valueMHz: 123.75, name: "Tower" },
    { type: "APP", valueMHz: 124.35, name: "Greensboro Approach" },
    { type: "CTAF", valueMHz: 123.75, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KINW": [
    { type: "ASOS", valueMHz: 118.875, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KIPL": [
    { type: "ASOS", valueMHz: 132.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KIPT": [
    { type: "ASOS", valueMHz: 125.225, name: "ASOS" },
    { type: "DEL", valueMHz: 124.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "CTAF", valueMHz: 119.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIRK": [
    { type: "ASOS", valueMHz: 121.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KISM": [
    { type: "AWOS", valueMHz: 128.775, name: "AWOS" },
    { type: "DEL", valueMHz: 119.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.45, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Orlando Approach" },
    { type: "CTAF", valueMHz: 124.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KISO": [
    { type: "AWOS", valueMHz: 132.75, name: "AWOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.6, name: "Tower" },
    { type: "APP", valueMHz: 127.3, name: "Seymour John Approach" },
    { type: "CTAF", valueMHz: 120.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KISP": [
    { type: "ATIS", valueMHz: 120.725, name: "ATIS" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 135.3, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "New York Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KITH": [
    { type: "ATIS", valueMHz: 125.175, name: "ATIS" },
    { type: "ASOS", valueMHz: 125.175, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "Elmira Approach" },
    { type: "CTAF", valueMHz: 119.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KIWA": [
    { type: "ATIS", valueMHz: 133.5, name: "ATIS" },
    { type: "AWOS", valueMHz: 133.5, name: "AWOS" },
    { type: "DEL", valueMHz: 128.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.25, name: "Ground" },
    { type: "TWR", valueMHz: 118.8, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Phoenix Approach" },
    { type: "CTAF", valueMHz: 120.6, name: "CTAF" }
  ],
  "KJAC": [
    { type: "ATIS", valueMHz: 120.625, name: "ATIS" },
    { type: "AWOS", valueMHz: 135.175, name: "AWOS" },
    { type: "GND", valueMHz: 124.55, name: "Ground" },
    { type: "TWR", valueMHz: 118.075, name: "Tower" },
    { type: "CTAF", valueMHz: 118.075, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJAN": [
    { type: "ATIS", valueMHz: 121.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 123.9, name: "Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJAX": [
    { type: "ATIS", valueMHz: 125.85, name: "ATIS" },
    { type: "DEL", valueMHz: 119.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJBR": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KJCT": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KJFK": [
    { type: "ATIS", valueMHz: 128.725, name: "ATIS" },
    { type: "DEL", valueMHz: 135.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "TWR", valueMHz: 123.9, name: "Tower" },
    { type: "APP", valueMHz: 125.7, name: "New York Approach" },
    { type: "APP", valueMHz: 127.4, name: "New York Approach" },
    { type: "APP", valueMHz: 132.4, name: "New York Approach" }
  ],
  "KJHW": [
    { type: "AWOS", valueMHz: 118.425, name: "AWOS" },
    { type: "APP", valueMHz: 126.05, name: "Erie Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KJKL": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KJLN": [
    { type: "ATIS", valueMHz: 120.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJMS": [
    { type: "ASOS", valueMHz: 118.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KJNX": [
    { type: "APP", valueMHz: 125.3, name: "Raleigh Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KJQF": [
    { type: "AWOS", valueMHz: 133.675, name: "AWOS" },
    { type: "DEL", valueMHz: 118.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 134.65, name: "Tower" },
    { type: "APP", valueMHz: 128.32, name: "Charlotte Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJST": [
    { type: "ATIS", valueMHz: 118.325, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 125.75, name: "Tower" },
    { type: "CTAF", valueMHz: 125.75, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KJWY": [
    { type: "AWOS", valueMHz: 119.575, name: "AWOS" },
    { type: "APP", valueMHz: 125.2, name: "Regional Approach" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KJXN": [
    { type: "ATIS", valueMHz: 125.725, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 127.3, name: "Lansing Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KKLS": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KL45": [
    { type: "APP", valueMHz: 126.45, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KL71": [
    { type: "AWOS", valueMHz: 120.875, name: "AWOS" },
    { type: "APP", valueMHz: 133.65, name: "Joshua Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KLAA": [
    { type: "ASOS", valueMHz: 135.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLAF": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "APP", valueMHz: 123.85, name: "Approach" },
    { type: "CTAF", valueMHz: 119.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLAL": [
    { type: "ATIS", valueMHz: 118.025, name: "ATIS" },
    { type: "GND", valueMHz: 121.4, name: "Ground" },
    { type: "TWR", valueMHz: 124.5, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "Tampa Approach" },
    { type: "CTAF", valueMHz: 124.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLAN": [
    { type: "ATIS", valueMHz: 119.75, name: "ATIS" },
    { type: "DEL", valueMHz: 123.675, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118.65, name: "Lansing Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLAR": [
    { type: "ASOS", valueMHz: 135.475, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KLAS": [
    { type: "ATIS", valueMHz: 132.4, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.1, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 125.025, name: "Las Vegas Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLAW": [
    { type: "ATIS", valueMHz: 120.75, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 120.55, name: "Fort Sill Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLAX": [
    { type: "ATIS", valueMHz: 133.8, name: "ATIS" },
    { type: "DEL", valueMHz: 121.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "SoCal Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLBB": [
    { type: "ATIS", valueMHz: 125.3, name: "ATIS" },
    { type: "DEL", valueMHz: 125.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLBE": [
    { type: "ATIS", valueMHz: 118.375, name: "ATIS" },
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 125, name: "Tower" },
    { type: "CTAF", valueMHz: 125, name: "CTAF" }
  ],
  "KLBF": [
    { type: "ASOS", valueMHz: 118.425, name: "ASOS" },
    { type: "DEL", valueMHz: 132.7, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLBL": [
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLBT": [
    { type: "ASOS", valueMHz: 134.775, name: "ASOS" },
    { type: "APP", valueMHz: 133, name: "Fayetteville Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLBX": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "DEL", valueMHz: 125.2, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 134.45, name: "Houston Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLCH": [
    { type: "ATIS", valueMHz: 118.75, name: "ATIS" },
    { type: "DEL", valueMHz: 126.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 119.35, name: "Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLCK": [
    { type: "AWOS", valueMHz: 132.75, name: "AWOS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 120.05, name: "Tower" },
    { type: "APP", valueMHz: 119.15, name: "Columbus Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLEB": [
    { type: "ATIS", valueMHz: 118.65, name: "ATIS" },
    { type: "ASOS", valueMHz: 118.65, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 125.95, name: "Tower" },
    { type: "APP", valueMHz: 134.7, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 125.95, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLEE": [
    { type: "ATIS", valueMHz: 134.325, name: "ATIS" },
    { type: "GND", valueMHz: 121.725, name: "Ground" },
    { type: "TWR", valueMHz: 119.35, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Orlando Approach" },
    { type: "UNICOM", valueMHz: 122.725, name: "UNICOM" }
  ],
  "KLEX": [
    { type: "ATIS", valueMHz: 126.3, name: "ATIS" },
    { type: "DEL", valueMHz: 132.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 120.15, name: "Lexington Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLFI": [
    { type: "DEL", valueMHz: 118.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Norfolk Approach" }
  ],
  "KLFK": [
    { type: "ASOS", valueMHz: 120.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLFT": [
    { type: "ATIS", valueMHz: 134.05, name: "ATIS" },
    { type: "DEL", valueMHz: 125.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLGA": [
    { type: "ATIS", valueMHz: 125.95, name: "ATIS" },
    { type: "DEL", valueMHz: 121.875, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "New York Approach" },
    { type: "APP", valueMHz: 132.7, name: "New York Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLGB": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "DEL", valueMHz: 118.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 133, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 124.65, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLGU": [
    { type: "ASOS", valueMHz: 135.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLIT": [
    { type: "ATIS", valueMHz: 125.65, name: "ATIS" },
    { type: "DEL", valueMHz: 118.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Little Rock Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLLQ": [
    { type: "ASOS", valueMHz: 133.325, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLMT": [
    { type: "ATIS", valueMHz: 126.5, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 123.675, name: "Kingsley Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLND": [
    { type: "ASOS", valueMHz: 118.15, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLNK": [
    { type: "ATIS", valueMHz: 118.05, name: "ATIS" },
    { type: "DEL", valueMHz: 120.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 124, name: "Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLNS": [
    { type: "ATIS", valueMHz: 125.675, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 126.45, name: "Harrisburg Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLOL": [
    { type: "ASOS", valueMHz: 120.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLOU": [
    { type: "DEL", valueMHz: 118.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 123.675, name: "Louisville Approach" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLOZ": [
    { type: "ASOS", valueMHz: 119.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLRD": [
    { type: "ATIS", valueMHz: 125.775, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLRF": [
    { type: "GND", valueMHz: 132.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.6, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Approach" }
  ],
  "KLRU": [
    { type: "AWOS", valueMHz: 119.025, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KLSE": [
    { type: "ATIS", valueMHz: 124.95, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.45, name: "Tower" },
    { type: "CTAF", valueMHz: 118.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLSF": [
    { type: "ATIS", valueMHz: 134.375, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.05, name: "Ground" },
    { type: "TWR", valueMHz: 119.05, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Atlanta Approach" }
  ],
  "KLSV": [
    { type: "DEL", valueMHz: 120.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 132.55, name: "Tower" },
    { type: "APP", valueMHz: 118.125, name: "Approach" }
  ],
  "KLTS": [
    { type: "DEL", valueMHz: 120.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 119.65, name: "Tower" },
    { type: "APP", valueMHz: 125.1, name: "Approach" }
  ],
  "KLUF": [
    { type: "ATIS", valueMHz: 134.925, name: "ATIS" },
    { type: "DEL", valueMHz: 126.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 133.175, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 120.7, name: "Approach" }
  ],
  "KLUK": [
    { type: "ATIS", valueMHz: 120.25, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLVM": [
    { type: "ASOS", valueMHz: 135.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLVS": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLWB": [
    { type: "AWOS", valueMHz: 121.4, name: "AWOS" },
    { type: "DEL", valueMHz: 120.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLWM": [
    { type: "ATIS", valueMHz: 126.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.75, name: "ASOS" },
    { type: "DEL", valueMHz: 124.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 124.3, name: "Ground" },
    { type: "TWR", valueMHz: 119.25, name: "Tower" },
    { type: "APP", valueMHz: 124.4, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 119.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KLWS": [
    { type: "ASOS", valueMHz: 135.575, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KLWT": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KLYH": [
    { type: "ATIS", valueMHz: 119.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.65, name: "Tower" },
    { type: "APP", valueMHz: 125.47, name: "Roanoke Approach" },
    { type: "CTAF", valueMHz: 127.65, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMAF": [
    { type: "ATIS", valueMHz: 126.8, name: "ATIS" },
    { type: "DEL", valueMHz: 118.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMBG": [
    { type: "ASOS", valueMHz: 121.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMBS": [
    { type: "ATIS", valueMHz: 118.6, name: "ATIS" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 120.95, name: "Saginaw Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMCB": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KMCC": [
    { type: "APP", valueMHz: 127.4, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KMCE": [
    { type: "ASOS", valueMHz: 132.175, name: "ASOS" },
    { type: "APP", valueMHz: 120.95, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KMCF": [
    { type: "ATIS", valueMHz: 133.825, name: "ATIS" },
    { type: "GND", valueMHz: 118.575, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "APP", valueMHz: 124.95, name: "Tampa Approach" }
  ],
  "KMCI": [
    { type: "ATIS", valueMHz: 126.625, name: "ATIS" },
    { type: "DEL", valueMHz: 135.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 125.75, name: "Tower" },
    { type: "APP", valueMHz: 120.95, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMCK": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMCN": [
    { type: "ATIS", valueMHz: 120.775, name: "ATIS" },
    { type: "ASOS", valueMHz: 120.775, name: "ASOS" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 128.2, name: "Tower" },
    { type: "APP", valueMHz: 118.95, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 128.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMCO": [
    { type: "ATIS", valueMHz: 121.25, name: "ATIS" },
    { type: "DEL", valueMHz: 134.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.45, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMCW": [
    { type: "ASOS", valueMHz: 120.3, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMDH": [
    { type: "ATIS", valueMHz: 119.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 125.35, name: "Tower" },
    { type: "CTAF", valueMHz: 125.35, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMDT": [
    { type: "ATIS", valueMHz: 118.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.8, name: "Tower" },
    { type: "APP", valueMHz: 118.25, name: "Approach" }
  ],
  "KMDW": [
    { type: "ATIS", valueMHz: 132.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 132.75, name: "ASOS" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 118.4, name: "Chicago Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMEI": [
    { type: "ATIS", valueMHz: 126.475, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "APP", valueMHz: 120.5, name: "Meridian Approach" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMEM": [
    { type: "ATIS", valueMHz: 127.75, name: "ATIS" },
    { type: "DEL", valueMHz: 125.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMER": [
    { type: "AWOS", valueMHz: 124.475, name: "AWOS" },
    { type: "APP", valueMHz: 120.95, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 123.075, name: "UNICOM" }
  ],
  "KMFD": [
    { type: "ATIS", valueMHz: 125.3, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "APP", valueMHz: 124.2, name: "Approach" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMFE": [
    { type: "ATIS", valueMHz: 128.5, name: "ATIS" },
    { type: "ASOS", valueMHz: 128.5, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Valley Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMFR": [
    { type: "ATIS", valueMHz: 127.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "Cascade Approach" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMGC": [
    { type: "DEL", valueMHz: 134.8, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 118.55, name: "South Bend Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KMGE": [
    { type: "GND", valueMHz: 125.3, name: "Ground" },
    { type: "TWR", valueMHz: 120.75, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Atlanta Approach" }
  ],
  "KMGM": [
    { type: "ATIS", valueMHz: 120.675, name: "ATIS" },
    { type: "DEL", valueMHz: 118.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.7, name: "Tower" },
    { type: "APP", valueMHz: 118.85, name: "Approach" },
    { type: "CTAF", valueMHz: 119.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMGW": [
    { type: "ASOS", valueMHz: 120.675, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.1, name: "Tower" },
    { type: "APP", valueMHz: 121.15, name: "Clarksburg Approach" },
    { type: "CTAF", valueMHz: 125.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMHK": [
    { type: "ASOS", valueMHz: 119.075, name: "ASOS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 118.55, name: "Tower" },
    { type: "APP", valueMHz: 127.35, name: "Approach" },
    { type: "CTAF", valueMHz: 118.55, name: "CTAF" }
  ],
  "KMHR": [
    { type: "ATIS", valueMHz: 118.325, name: "ATIS" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 120.65, name: "Tower" },
    { type: "APP", valueMHz: 127.4, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 123.075, name: "UNICOM" }
  ],
  "KMHT": [
    { type: "ATIS", valueMHz: 119.55, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.55, name: "ASOS" },
    { type: "DEL", valueMHz: 135.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Boston Approach" },
    { type: "APP", valueMHz: 134.75, name: "Boston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMHV": [
    { type: "GND", valueMHz: 123.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.6, name: "Tower" },
    { type: "APP", valueMHz: 133.65, name: "Joshua Approach" },
    { type: "CTAF", valueMHz: 127.6, name: "CTAF" }
  ],
  "KMIA": [
    { type: "ATIS", valueMHz: 119.15, name: "ATIS" },
    { type: "DEL", valueMHz: 120.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 120.5, name: "Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMIB": [
    { type: "GND", valueMHz: 134, name: "Ground" },
    { type: "TWR", valueMHz: 120.65, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Approach" }
  ],
  "KMIE": [
    { type: "ATIS", valueMHz: 133.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMIV": [
    { type: "ASOS", valueMHz: 119.6, name: "ASOS" },
    { type: "APP", valueMHz: 124.6, name: "Approach" },
    { type: "CTAF", valueMHz: 123.65, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMKC": [
    { type: "ATIS", valueMHz: 120.75, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 133.3, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMKE": [
    { type: "ATIS", valueMHz: 126.4, name: "ATIS" },
    { type: "DEL", valueMHz: 120.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "Milwaukee Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMKG": [
    { type: "ATIS", valueMHz: 124.3, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 126.25, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Approach" },
    { type: "CTAF", valueMHz: 126.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMKL": [
    { type: "ASOS", valueMHz: 119.325, name: "ASOS" },
    { type: "GND", valueMHz: 120.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.15, name: "Tower" },
    { type: "CTAF", valueMHz: 127.15, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMLB": [
    { type: "ATIS", valueMHz: 132.55, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 132.65, name: "Orlando Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMLC": [
    { type: "ASOS", valueMHz: 135.125, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMLI": [
    { type: "ATIS", valueMHz: 121.2, name: "ATIS" },
    { type: "DEL", valueMHz: 123.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Approach" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMLS": [
    { type: "ASOS", valueMHz: 135.575, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMLU": [
    { type: "ATIS", valueMHz: 125.05, name: "ATIS" },
    { type: "DEL", valueMHz: 121.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 118.15, name: "Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMMH": [
    { type: "AWOS", valueMHz: 118.05, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMMT": [
    { type: "GND", valueMHz: 127.625, name: "Ground" },
    { type: "TWR", valueMHz: 132.4, name: "Tower" },
    { type: "APP", valueMHz: 125.4, name: "Shaw Approach" },
    { type: "CTAF", valueMHz: 132.4, name: "CTAF" }
  ],
  "KMMU": [
    { type: "ATIS", valueMHz: 124.25, name: "ATIS" },
    { type: "DEL", valueMHz: 121.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 127.6, name: "New York Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" }
  ],
  "KMMV": [
    { type: "ASOS", valueMHz: 135.675, name: "ASOS" },
    { type: "DEL", valueMHz: 118.35, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 126, name: "Portland Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMOB": [
    { type: "ATIS", valueMHz: 124.75, name: "ATIS" },
    { type: "DEL", valueMHz: 119.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.5, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMOD": [
    { type: "ATIS", valueMHz: 127.7, name: "ATIS" },
    { type: "ASOS", valueMHz: 127.7, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.3, name: "Tower" },
    { type: "APP", valueMHz: 120.95, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 125.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMOT": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMPV": [
    { type: "ASOS", valueMHz: 132.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMQY": [
    { type: "ASOS", valueMHz: 119.125, name: "ASOS" },
    { type: "DEL", valueMHz: 121.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.4, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 128.45, name: "Nashville Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMRB": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "DEL", valueMHz: 132.075, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 126.1, name: "Potomac Approach" },
    { type: "CTAF", valueMHz: 124.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMRY": [
    { type: "ATIS", valueMHz: 119.25, name: "ATIS" },
    { type: "DEL", valueMHz: 135.45, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 127.15, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 118.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMSL": [
    { type: "ASOS", valueMHz: 119.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KMSN": [
    { type: "ATIS", valueMHz: 124.65, name: "ATIS" },
    { type: "DEL", valueMHz: 121.62, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "Madison Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMSO": [
    { type: "ATIS", valueMHz: 126.65, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.4, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Spokane Approach" },
    { type: "CTAF", valueMHz: 118.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMSP": [
    { type: "ATIS", valueMHz: 120.8, name: "ATIS" },
    { type: "DEL", valueMHz: 133.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 123.675, name: "Tower" },
    { type: "APP", valueMHz: 118.72, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMSS": [
    { type: "ASOS", valueMHz: 128.075, name: "ASOS" },
    { type: "APP", valueMHz: 135.25, name: "Boston Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KMSY": [
    { type: "ATIS", valueMHz: 127.55, name: "ATIS" },
    { type: "DEL", valueMHz: 127.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 123.85, name: "New Orleans Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMTC": [
    { type: "ATIS", valueMHz: 125.325, name: "ATIS" },
    { type: "DEL", valueMHz: 119, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.3, name: "Ground" },
    { type: "TWR", valueMHz: 120.15, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Approach" }
  ],
  "KMTH": [
    { type: "ASOS", valueMHz: 135.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMTJ": [
    { type: "ASOS", valueMHz: 135.225, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMTN": [
    { type: "ATIS", valueMHz: 124.925, name: "ATIS" },
    { type: "AWOS", valueMHz: 124.925, name: "AWOS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Potomac Approach" },
    { type: "CTAF", valueMHz: 121.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMUI": [
    { type: "GND", valueMHz: 121.625, name: "Ground" },
    { type: "TWR", valueMHz: 126.2, name: "Tower" },
    { type: "APP", valueMHz: 118.25, name: "Harrisburg Approach" },
    { type: "CTAF", valueMHz: 126.2, name: "CTAF" }
  ],
  "KMUO": [
    { type: "DEL", valueMHz: 127.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 120.5, name: "Ground" },
    { type: "TWR", valueMHz: 133.85, name: "Tower" },
    { type: "APP", valueMHz: 124.8, name: "Approach" }
  ],
  "KMWA": [
    { type: "AWOS", valueMHz: 119.675, name: "AWOS" },
    { type: "DEL", valueMHz: 125.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 128.4, name: "Tower" },
    { type: "CTAF", valueMHz: 128.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMWH": [
    { type: "ATIS", valueMHz: 119.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.25, name: "Tower" },
    { type: "APP", valueMHz: 126.4, name: "Approach" },
    { type: "CTAF", valueMHz: 118.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMWL": [
    { type: "ASOS", valueMHz: 135.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.725, name: "UNICOM" }
  ],
  "KMXF": [
    { type: "ATIS", valueMHz: 134.7, name: "ATIS" },
    { type: "GND", valueMHz: 127.15, name: "Ground" },
    { type: "TWR", valueMHz: 118.15, name: "Tower" },
    { type: "APP", valueMHz: 121.2, name: "Montgomery Approach" }
  ],
  "KMYL": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KMYR": [
    { type: "ATIS", valueMHz: 123.925, name: "ATIS" },
    { type: "AWOS", valueMHz: 124.5, name: "AWOS" },
    { type: "DEL", valueMHz: 119.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 120.3, name: "Ground" },
    { type: "TWR", valueMHz: 128.45, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "CTAF", valueMHz: 128.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KMYV": [
    { type: "ASOS", valueMHz: 118.475, name: "ASOS" },
    { type: "APP", valueMHz: 125.4, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KNBC": [
    { type: "TWR", valueMHz: 119.05, name: "Tower" },
    { type: "APP", valueMHz: 118.45, name: "Approach" }
  ],
  "KNBG": [
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 123.8, name: "Tower" },
    { type: "APP", valueMHz: 123.85, name: "Approach" }
  ],
  "KNCA": [
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120, name: "Tower" },
    { type: "APP", valueMHz: 119.35, name: "Cherry Point Approach" }
  ],
  "KNDZ": [
    { type: "TWR", valueMHz: 121.4, name: "Tower" },
    { type: "APP", valueMHz: 124.85, name: "Pensacola Approach" }
  ],
  "KNEL": [
    { type: "GND", valueMHz: 118.375, name: "Ground" },
    { type: "TWR", valueMHz: 127.775, name: "Tower" },
    { type: "APP", valueMHz: 124.15, name: "Mc Guire Approach" }
  ],
  "KNEW": [
    { type: "ATIS", valueMHz: 124.9, name: "ATIS" },
    { type: "DEL", valueMHz: 127.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.95, name: "Tower" },
    { type: "APP", valueMHz: 123.85, name: "New Orleans Approach" },
    { type: "CTAF", valueMHz: 118.95, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KNFG": [
    { type: "DEL", valueMHz: 126.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.775, name: "Ground" },
    { type: "TWR", valueMHz: 128.775, name: "Tower" },
    { type: "APP", valueMHz: 127.3, name: "SoCal Approach" },
    { type: "APP", valueMHz: 128.45, name: "Approach" }
  ],
  "KNFL": [
    { type: "TWR", valueMHz: 119.25, name: "Tower" },
    { type: "APP", valueMHz: 120.85, name: "Navy Fallon Approach" }
  ],
  "KNFW": [
    { type: "GND", valueMHz: 126.4, name: "Ground" },
    { type: "TWR", valueMHz: 120.95, name: "Tower" },
    { type: "APP", valueMHz: 125.8, name: "Regional Approach" }
  ],
  "KNGP": [
    { type: "GND", valueMHz: 118.7, name: "Ground" },
    { type: "TWR", valueMHz: 134.85, name: "Tower" },
    { type: "APP", valueMHz: 120.9, name: "Approach" }
  ],
  "KNGU": [
    { type: "ATIS", valueMHz: 118.425, name: "ATIS" },
    { type: "DEL", valueMHz: 120.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 118.9, name: "Approach" }
  ],
  "KNHK": [
    { type: "DEL", valueMHz: 135.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 120.6, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "Approach" }
  ],
  "KNID": [
    { type: "TWR", valueMHz: 120.15, name: "Tower" },
    { type: "APP", valueMHz: 133.65, name: "Joshua Approach" }
  ],
  "KNIP": [
    { type: "DEL", valueMHz: 134.775, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.6, name: "Ground" },
    { type: "TWR", valueMHz: 120, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Approach" }
  ],
  "KNJK": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" }
  ],
  "KNKT": [
    { type: "DEL", valueMHz: 125.95, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.625, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 119.35, name: "Approach" }
  ],
  "KNKX": [
    { type: "DEL", valueMHz: 125.975, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.625, name: "Ground" },
    { type: "TWR", valueMHz: 135.2, name: "Tower" },
    { type: "APP", valueMHz: 132.2, name: "SoCal Approach" }
  ],
  "KNLC": [
    { type: "DEL", valueMHz: 124.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 128.3, name: "Tower" },
    { type: "APP", valueMHz: 118.15, name: "Approach" }
  ],
  "KNMM": [
    { type: "TWR", valueMHz: 126.2, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" }
  ],
  "KNPA": [
    { type: "DEL", valueMHz: 134.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "Approach" }
  ],
  "KNQA": [
    { type: "AWOS", valueMHz: 118.925, name: "AWOS" },
    { type: "GND", valueMHz: 121.375, name: "Ground" },
    { type: "TWR", valueMHz: 120.25, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Memphis Approach" },
    { type: "CTAF", valueMHz: 120.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KNQI": [
    { type: "TWR", valueMHz: 124.1, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "Approach" }
  ],
  "KNQX": [
    { type: "DEL", valueMHz: 121.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 126.1, name: "Tower" },
    { type: "APP", valueMHz: 119.25, name: "Approach" }
  ],
  "KNRB": [
    { type: "GND", valueMHz: 126.5, name: "Ground" },
    { type: "TWR", valueMHz: 118.75, name: "Tower" },
    { type: "APP", valueMHz: 124.9, name: "Jacksonville Approach" }
  ],
  "KNSE": [
    { type: "TWR", valueMHz: 121.4, name: "Tower" },
    { type: "APP", valueMHz: 127.35, name: "Pensacola Approach" }
  ],
  "KNTD": [
    { type: "ATIS", valueMHz: 125.55, name: "ATIS" },
    { type: "DEL", valueMHz: 120.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 124.85, name: "Tower" },
    { type: "APP", valueMHz: 128.65, name: "Approach" }
  ],
  "KNTU": [
    { type: "TWR", valueMHz: 127.075, name: "Tower" }
  ],
  "KNUQ": [
    { type: "ATIS", valueMHz: 124.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 119.55, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 119.55, name: "CTAF" }
  ],
  "KNUW": [
    { type: "ATIS", valueMHz: 134.15, name: "ATIS" },
    { type: "DEL", valueMHz: 124.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 127.9, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Whidbey Approach" }
  ],
  "KNXP": [
    { type: "TWR", valueMHz: 135.525, name: "Tower" }
  ],
  "KNYG": [
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 124.65, name: "Potomac Approach" }
  ],
  "KNYL": [
    { type: "ATIS", valueMHz: 118.8, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 124.7, name: "Approach" },
    { type: "UNICOM", valueMHz: 119.3, name: "UNICOM" }
  ],
  "KNZY": [
    { type: "DEL", valueMHz: 128.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118, name: "Ground" },
    { type: "TWR", valueMHz: 135.1, name: "Tower" },
    { type: "APP", valueMHz: 125.15, name: "SoCal Approach" }
  ],
  "KOAJ": [
    { type: "AWOS", valueMHz: 124.475, name: "AWOS" },
    { type: "APP", valueMHz: 121.4, name: "Wilmington Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KOAK": [
    { type: "ATIS", valueMHz: 133.775, name: "ATIS" },
    { type: "DEL", valueMHz: 121.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOFF": [
    { type: "ATIS", valueMHz: 126.025, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "Omaha Approach" }
  ],
  "KOFK": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KOGB": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "APP", valueMHz: 124.15, name: "Columbia Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KOGD": [
    { type: "ATIS", valueMHz: 125.55, name: "ATIS" },
    { type: "ASOS", valueMHz: 125.55, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOGS": [
    { type: "AWOS", valueMHz: 118.525, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KOKB": [
    { type: "ASOS", valueMHz: 127.8, name: "ASOS" },
    { type: "APP", valueMHz: 127.3, name: "SoCal Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KOKC": [
    { type: "ATIS", valueMHz: 125.85, name: "ATIS" },
    { type: "DEL", valueMHz: 124.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.35, name: "Tower" },
    { type: "APP", valueMHz: 120.45, name: "Oke City Approach" }
  ],
  "KOLF": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KOLM": [
    { type: "ATIS", valueMHz: 135.375, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.725, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 124.4, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Seattle Approach" },
    { type: "CTAF", valueMHz: 124.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOLS": [
    { type: "ASOS", valueMHz: 121.125, name: "ASOS" },
    { type: "APP", valueMHz: 125.1, name: "Tucson Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KOLU": [
    { type: "AWOS", valueMHz: 125.525, name: "AWOS" },
    { type: "CTAF", valueMHz: 123.05, name: "CTAF" }
  ],
  "KOMA": [
    { type: "ATIS", valueMHz: 120.4, name: "ATIS" },
    { type: "DEL", valueMHz: 119.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 132.1, name: "Tower" },
    { type: "APP", valueMHz: 135.875, name: "Omaha Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KONO": [
    { type: "ASOS", valueMHz: 135.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KONP": [
    { type: "AWOS", valueMHz: 133.9, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KONT": [
    { type: "ATIS", valueMHz: 124.25, name: "ATIS" },
    { type: "DEL", valueMHz: 118.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.6, name: "Tower" },
    { type: "APP", valueMHz: 119.65, name: "SoCal Approach" }
  ],
  "KOPF": [
    { type: "ATIS", valueMHz: 125.9, name: "ATIS" },
    { type: "DEL", valueMHz: 119.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 128.6, name: "Miami Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" }
  ],
  "KOQU": [
    { type: "GND", valueMHz: 134.5, name: "Ground" },
    { type: "TWR", valueMHz: 126.35, name: "Tower" },
    { type: "APP", valueMHz: 135.4, name: "Providence Approach" },
    { type: "CTAF", valueMHz: 126.35, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KORD": [
    { type: "ATIS", valueMHz: 135.4, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.4, name: "ASOS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.675, name: "Ground" },
    { type: "TWR", valueMHz: 126.9, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Chicago Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KORF": [
    { type: "ATIS", valueMHz: 127.15, name: "ATIS" },
    { type: "DEL", valueMHz: 118.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.8, name: "Tower" },
    { type: "APP", valueMHz: 118.9, name: "Approach" }
  ],
  "KORH": [
    { type: "ATIS", valueMHz: 126.55, name: "ATIS" },
    { type: "DEL", valueMHz: 128.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 123.85, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 119, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 120.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KORL": [
    { type: "ATIS", valueMHz: 127.25, name: "ATIS" },
    { type: "DEL", valueMHz: 128.45, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.4, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Orlando Approach" },
    { type: "APP", valueMHz: 119.775, name: "Orlando Approach" },
    { type: "APP", valueMHz: 120.15, name: "Orlando Approach" },
    { type: "APP", valueMHz: 124.8, name: "Orlando Approach" },
    { type: "APP", valueMHz: 135.3, name: "Orlando Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KORS": [
    { type: "AWOS", valueMHz: 135.425, name: "AWOS" },
    { type: "CTAF", valueMHz: 128.25, name: "CTAF" }
  ],
  "KOSH": [
    { type: "ATIS", valueMHz: 125.9, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOSU": [
    { type: "ATIS", valueMHz: 121.35, name: "ATIS" },
    { type: "TWR", valueMHz: 118.8, name: "Tower" },
    { type: "APP", valueMHz: 120.2, name: "Columbus Approach" },
    { type: "CTAF", valueMHz: 118.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOTH": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KOTM": [
    { type: "ASOS", valueMHz: 124.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KOWB": [
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 126.4, name: "Evansville Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KOWD": [
    { type: "ATIS", valueMHz: 119.95, name: "ATIS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 126, name: "Tower" },
    { type: "APP", valueMHz: 124.1, name: "Boston Approach" },
    { type: "CTAF", valueMHz: 126, name: "CTAF" }
  ],
  "KOXB": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "APP", valueMHz: 127.95, name: "Patuxent Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KOXR": [
    { type: "ATIS", valueMHz: 118.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 134.95, name: "Tower" },
    { type: "APP", valueMHz: 124.7, name: "Pt Mugu Approach" },
    { type: "CTAF", valueMHz: 134.95, name: "CTAF" }
  ],
  "KOZR": [
    { type: "DEL", valueMHz: 118.075, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 135.2, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "CTAF", valueMHz: 135.2, name: "CTAF" }
  ],
  "KPAE": [
    { type: "ATIS", valueMHz: 128.65, name: "ATIS" },
    { type: "DEL", valueMHz: 126.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.2, name: "Tower" },
    { type: "TWR", valueMHz: 132.95, name: "Tower" },
    { type: "CTAF", valueMHz: 132.95, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPAH": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.6, name: "Tower" },
    { type: "CTAF", valueMHz: 119.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPAM": [
    { type: "DEL", valueMHz: 118.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 133.95, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Approach" }
  ],
  "KPAO": [
    { type: "ATIS", valueMHz: 135.275, name: "ATIS" },
    { type: "GND", valueMHz: 125, name: "Ground" },
    { type: "TWR", valueMHz: 118.6, name: "Tower" },
    { type: "APP", valueMHz: 121.3, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 118.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPBF": [
    { type: "ASOS", valueMHz: 120.775, name: "ASOS" },
    { type: "DEL", valueMHz: 119.85, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 119.85, name: "Little Rock Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPBG": [
    { type: "APP", valueMHz: 121.1, name: "Burlington Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KPBI": [
    { type: "ATIS", valueMHz: 123.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.975, name: "ASOS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPCW": [
    { type: "AWOS", valueMHz: 118.775, name: "AWOS" },
    { type: "APP", valueMHz: 126.35, name: "Cleveland Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPDK": [
    { type: "ATIS", valueMHz: 128.4, name: "ATIS" },
    { type: "DEL", valueMHz: 120.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 126.975, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPDT": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.7, name: "Tower" },
    { type: "APP", valueMHz: 133.15, name: "Chinook Approach" },
    { type: "CTAF", valueMHz: 119.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPDX": [
    { type: "ATIS", valueMHz: 120.625, name: "ATIS" },
    { type: "DEL", valueMHz: 120.125, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Portland Approach" },
    { type: "APP", valueMHz: 129.92, name: "Portland Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPGA": [
    { type: "ASOS", valueMHz: 120.625, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPGD": [
    { type: "ASOS", valueMHz: 135.675, name: "ASOS" },
    { type: "DEL", valueMHz: 127.05, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 126.8, name: "Fort Myers Approach" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KPGV": [
    { type: "AWOS", valueMHz: 128.425, name: "AWOS" },
    { type: "DEL", valueMHz: 122.35, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPHF": [
    { type: "ATIS", valueMHz: 128.65, name: "ATIS" },
    { type: "DEL", valueMHz: 121.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 124.9, name: "Tower" },
    { type: "APP", valueMHz: 125.7, name: "Norfolk Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPHL": [
    { type: "ATIS", valueMHz: 133.4, name: "ATIS" },
    { type: "DEL", valueMHz: 118.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPHX": [
    { type: "ATIS", valueMHz: 127.575, name: "ATIS" },
    { type: "DEL", valueMHz: 118.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 119.75, name: "Ground" },
    { type: "GND", valueMHz: 132.55, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 120.7, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 123.7, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 124.1, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 124.9, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 126.8, name: "Phoenix Approach" },
    { type: "APP", valueMHz: 128.65, name: "Phoenix Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPIA": [
    { type: "ATIS", valueMHz: 126.1, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.1, name: "ASOS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 124.675, name: "Peoria Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPIB": [
    { type: "AWOS", valueMHz: 128.325, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPIE": [
    { type: "ATIS", valueMHz: 134.5, name: "ATIS" },
    { type: "DEL", valueMHz: 120.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.3, name: "Tampa Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPIH": [
    { type: "ASOS", valueMHz: 135.625, name: "ASOS" },
    { type: "DEL", valueMHz: 126.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "CTAF", valueMHz: 119.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPIR": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPIT": [
    { type: "ATIS", valueMHz: 127.25, name: "ATIS" },
    { type: "DEL", valueMHz: 126.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 120.875, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPKB": [
    { type: "ATIS", valueMHz: 124.35, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "CTAF", valueMHz: 123.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPLN": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPMD": [
    { type: "ASOS", valueMHz: 118.275, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 123.7, name: "Tower" },
    { type: "APP", valueMHz: 124.55, name: "Joshua Approach" },
    { type: "CTAF", valueMHz: 123.7, name: "CTAF" }
  ],
  "KPNA": [
    { type: "AWOS", valueMHz: 118.325, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPNC": [
    { type: "ASOS", valueMHz: 134.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPNE": [
    { type: "ATIS", valueMHz: 121.15, name: "ATIS" },
    { type: "DEL", valueMHz: 127.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 126.9, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Philadelphia Approach" },
    { type: "CTAF", valueMHz: 126.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPNS": [
    { type: "ATIS", valueMHz: 121.25, name: "ATIS" },
    { type: "DEL", valueMHz: 123.725, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPOB": [
    { type: "ATIS", valueMHz: 132.3, name: "ATIS" },
    { type: "GND", valueMHz: 124.55, name: "Ground" },
    { type: "TWR", valueMHz: 135.025, name: "Tower" },
    { type: "APP", valueMHz: 125.175, name: "Fayetteville Approach" }
  ],
  "KPOE": [
    { type: "ATIS", valueMHz: 134.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "APP", valueMHz: 123.7, name: "Approach" }
  ],
  "KPOU": [
    { type: "ATIS", valueMHz: 126.75, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.75, name: "ASOS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124, name: "Tower" },
    { type: "CTAF", valueMHz: 124, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPQI": [
    { type: "AWOS", valueMHz: 118.025, name: "AWOS" },
    { type: "DEL", valueMHz: 121.6, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPRB": [
    { type: "ASOS", valueMHz: 132.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KPRC": [
    { type: "ATIS", valueMHz: 127.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.3, name: "Tower" },
    { type: "CTAF", valueMHz: 125.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPRX": [
    { type: "AWOS", valueMHz: 119.675, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KPSC": [
    { type: "ATIS", valueMHz: 125.65, name: "ATIS" },
    { type: "DEL", valueMHz: 120, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 135.3, name: "Tower" },
    { type: "APP", valueMHz: 128.75, name: "Chinook Approach" },
    { type: "CTAF", valueMHz: 135.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPSM": [
    { type: "ATIS", valueMHz: 132.05, name: "ATIS" },
    { type: "GND", valueMHz: 120.95, name: "Ground" },
    { type: "TWR", valueMHz: 128.4, name: "Tower" },
    { type: "APP", valueMHz: 125.05, name: "Boston Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPSP": [
    { type: "ATIS", valueMHz: 118.25, name: "ATIS" },
    { type: "DEL", valueMHz: 128.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.7, name: "Tower" },
    { type: "APP", valueMHz: 126.7, name: "Approach" },
    { type: "CTAF", valueMHz: 119.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPTK": [
    { type: "ATIS", valueMHz: 125.45, name: "ATIS" },
    { type: "DEL", valueMHz: 118.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 127.5, name: "Detroit Approach" },
    { type: "CTAF", valueMHz: 120.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPUB": [
    { type: "ATIS", valueMHz: 125.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "Approach" },
    { type: "CTAF", valueMHz: 119.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPUW": [
    { type: "ASOS", valueMHz: 135.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KPVD": [
    { type: "ATIS", valueMHz: 124.2, name: "ATIS" },
    { type: "DEL", valueMHz: 126.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 135.4, name: "Providence Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" }
  ],
  "KPVU": [
    { type: "ATIS", valueMHz: 135.175, name: "ATIS" },
    { type: "AWOS", valueMHz: 135.175, name: "AWOS" },
    { type: "GND", valueMHz: 119.4, name: "Ground" },
    { type: "TWR", valueMHz: 125.3, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "Salt Lake City Approach" },
    { type: "UNICOM", valueMHz: 125.3, name: "UNICOM" }
  ],
  "KPWK": [
    { type: "ATIS", valueMHz: 124.2, name: "ATIS" },
    { type: "DEL", valueMHz: 124.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 120.55, name: "Chicago Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPWM": [
    { type: "ATIS", valueMHz: 119.05, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 119.75, name: "Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KPWT": [
    { type: "AWOS", valueMHz: 121.2, name: "AWOS" },
    { type: "APP", valueMHz: 127.1, name: "Seattle Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KRAL": [
    { type: "ATIS", valueMHz: 128.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 121, name: "Tower" },
    { type: "APP", valueMHz: 135.4, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 121, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRAP": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 125.85, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Ellsworth Approach" },
    { type: "CTAF", valueMHz: 125.85, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRBL": [
    { type: "ASOS", valueMHz: 120.775, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KRCA": [
    { type: "ATIS", valueMHz: 120.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 126.05, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Approach" }
  ],
  "KRDD": [
    { type: "ATIS", valueMHz: 124.1, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRDG": [
    { type: "ATIS", valueMHz: 127.1, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 125.15, name: "Approach" },
    { type: "CTAF", valueMHz: 119.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRDM": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.5, name: "Tower" },
    { type: "CTAF", valueMHz: 124.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRDR": [
    { type: "DEL", valueMHz: 119.15, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 119.15, name: "Ground" },
    { type: "TWR", valueMHz: 124.9, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Approach" }
  ],
  "KRDU": [
    { type: "ATIS", valueMHz: 123.8, name: "ATIS" },
    { type: "DEL", valueMHz: 120.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "APP", valueMHz: 124.8, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRFD": [
    { type: "ATIS", valueMHz: 126.7, name: "ATIS" },
    { type: "DEL", valueMHz: 119.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Rockford Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRHI": [
    { type: "ASOS", valueMHz: 126.825, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KRHP": [
    { type: "AWOS", valueMHz: 119.675, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KRIC": [
    { type: "ATIS", valueMHz: 119.15, name: "ATIS" },
    { type: "DEL", valueMHz: 127.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.1, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Potomac Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRIL": [
    { type: "ASOS", valueMHz: 135.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KRIV": [
    { type: "ATIS", valueMHz: 134.75, name: "ATIS" },
    { type: "TWR", valueMHz: 127.65, name: "Tower" },
    { type: "APP", valueMHz: 119.25, name: "Approach" }
  ],
  "KRIW": [
    { type: "ASOS", valueMHz: 121.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KRKD": [
    { type: "AWOS", valueMHz: 119.025, name: "AWOS" },
    { type: "APP", valueMHz: 123.8, name: "Brunswick Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KRKS": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KRME": [
    { type: "APP", valueMHz: 120.925, name: "Approach" },
    { type: "CTAF", valueMHz: 125.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KRMG": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KRND": [
    { type: "GND", valueMHz: 119.75, name: "Ground" },
    { type: "TWR", valueMHz: 128.25, name: "Tower" },
    { type: "APP", valueMHz: 124.45, name: "San Antonio Approach" }
  ],
  "KRNH": [
    { type: "ASOS", valueMHz: 120, name: "ASOS" },
    { type: "APP", valueMHz: 121.2, name: "Minneapolis Approach" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KRNO": [
    { type: "ATIS", valueMHz: 135.8, name: "ATIS" },
    { type: "DEL", valueMHz: 124.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRNT": [
    { type: "ATIS", valueMHz: 126.95, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 124.7, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Seattle Approach" },
    { type: "CTAF", valueMHz: 124.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.85, name: "UNICOM" }
  ],
  "KROA": [
    { type: "ATIS", valueMHz: 134.95, name: "ATIS" },
    { type: "DEL", valueMHz: 119.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.15, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KROC": [
    { type: "ATIS", valueMHz: 124.825, name: "ATIS" },
    { type: "DEL", valueMHz: 118.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.55, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KROW": [
    { type: "ATIS", valueMHz: 128.45, name: "ATIS" },
    { type: "DEL", valueMHz: 132.875, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRSL": [
    { type: "ASOS", valueMHz: 128.325, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KRST": [
    { type: "ATIS", valueMHz: 120.5, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRSW": [
    { type: "ATIS", valueMHz: 124.65, name: "ATIS" },
    { type: "DEL", valueMHz: 132.075, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 128.75, name: "Tower" },
    { type: "APP", valueMHz: 119.75, name: "Fort Myers Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRUT": [
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KRVS": [
    { type: "ATIS", valueMHz: 126.5, name: "ATIS" },
    { type: "DEL", valueMHz: 124.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.2, name: "Tower" },
    { type: "APP", valueMHz: 119.85, name: "Tulsa Approach" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KRWF": [
    { type: "ASOS", valueMHz: 126.575, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KRWI": [
    { type: "ASOS", valueMHz: 118.875, name: "ASOS" },
    { type: "DEL", valueMHz: 122.3, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KRWL": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KRYY": [
    { type: "AWOS", valueMHz: 128.125, name: "AWOS" },
    { type: "GND", valueMHz: 119, name: "Ground" },
    { type: "TWR", valueMHz: 125.9, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Atlanta Approach" },
    { type: "CTAF", valueMHz: 125.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KSAC": [
    { type: "ATIS", valueMHz: 125.5, name: "ATIS" },
    { type: "GND", valueMHz: 125, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 125.25, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSAF": [
    { type: "ATIS", valueMHz: 128.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSAN": [
    { type: "ATIS", valueMHz: 134.8, name: "ATIS" },
    { type: "DEL", valueMHz: 125.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 123.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "SoCal Approach" },
    { type: "APP", valueMHz: 124.35, name: "SoCal Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSAT": [
    { type: "ATIS", valueMHz: 118.9, name: "ATIS" },
    { type: "DEL", valueMHz: 126.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSAV": [
    { type: "ATIS", valueMHz: 123.75, name: "ATIS" },
    { type: "DEL", valueMHz: 119.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 125.975, name: "Tower" },
    { type: "APP", valueMHz: 118.4, name: "Approach" },
    { type: "CTAF", valueMHz: 125.975, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSAW": [
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "TWR", valueMHz: 119.975, name: "Tower" },
    { type: "CTAF", valueMHz: 119.975, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KSBA": [
    { type: "ATIS", valueMHz: 132.65, name: "ATIS" },
    { type: "DEL", valueMHz: 132.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.7, name: "Tower" },
    { type: "APP", valueMHz: 120.55, name: "Approach" },
    { type: "APP", valueMHz: 124.15, name: "Approach" },
    { type: "APP", valueMHz: 125.4, name: "Approach" },
    { type: "APP", valueMHz: 127.725, name: "Approach" },
    { type: "CTAF", valueMHz: 119.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSBD": [
    { type: "ATIS", valueMHz: 124.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 119.45, name: "Tower" },
    { type: "APP", valueMHz: 127, name: "SoCal Approach" },
    { type: "APP", valueMHz: 134, name: "SoCal Approach" },
    { type: "APP", valueMHz: 135.4, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 119.45, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.975, name: "UNICOM" }
  ],
  "KSBN": [
    { type: "ATIS", valueMHz: 120.675, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 135.675, name: "Tower" },
    { type: "APP", valueMHz: 118.55, name: "South Bend Approach" },
    { type: "APP", valueMHz: 124.1, name: "South Bend Approach" },
    { type: "APP", valueMHz: 132.05, name: "South Bend Approach" },
    { type: "CTAF", valueMHz: 135.675, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSBP": [
    { type: "ATIS", valueMHz: 120.6, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 124, name: "Tower" },
    { type: "CTAF", valueMHz: 124, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSBY": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "DEL", valueMHz: 123.775, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 123.775, name: "Ground" },
    { type: "TWR", valueMHz: 119.425, name: "Tower" },
    { type: "APP", valueMHz: 127.95, name: "Patuxent Approach" },
    { type: "CTAF", valueMHz: 119.425, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSCH": [
    { type: "AWOS", valueMHz: 119.275, name: "AWOS" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "Albany Approach" },
    { type: "CTAF", valueMHz: 121.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSCK": [
    { type: "ATIS", valueMHz: 118.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 123.85, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSDF": [
    { type: "ATIS", valueMHz: 118.725, name: "ATIS" },
    { type: "DEL", valueMHz: 126.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124.2, name: "Tower" },
    { type: "APP", valueMHz: 123.675, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSDM": [
    { type: "ATIS", valueMHz: 132.35, name: "ATIS" },
    { type: "DEL", valueMHz: 124.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 124.4, name: "Ground" },
    { type: "TWR", valueMHz: 126.5, name: "Tower" },
    { type: "APP", valueMHz: 124.35, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 126.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSDY": [
    { type: "AWOS", valueMHz: 119.275, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSEA": [
    { type: "ATIS", valueMHz: 118, name: "ATIS" },
    { type: "DEL", valueMHz: 128, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 119.2, name: "Seattle Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSFB": [
    { type: "ATIS", valueMHz: 125.975, name: "ATIS" },
    { type: "DEL", valueMHz: 121.35, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.35, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 119.775, name: "Approach" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" }
  ],
  "KSFF": [
    { type: "ATIS", valueMHz: 120.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 132.5, name: "Tower" },
    { type: "APP", valueMHz: 133.35, name: "Spokane Approach" },
    { type: "CTAF", valueMHz: 132.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSFO": [
    { type: "ATIS", valueMHz: 135.1, name: "ATIS" },
    { type: "AWOS", valueMHz: 118.05, name: "AWOS" },
    { type: "DEL", valueMHz: 118.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.5, name: "Tower" },
    { type: "APP", valueMHz: 128.325, name: "NorCal Approach" },
    { type: "APP", valueMHz: 133.95, name: "NorCal Approach" },
    { type: "APP", valueMHz: 134.5, name: "NorCal Approach" }
  ],
  "KSGF": [
    { type: "ATIS", valueMHz: 119.05, name: "ATIS" },
    { type: "DEL", valueMHz: 123.675, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "APP", valueMHz: 124.95, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSGH": [
    { type: "ASOS", valueMHz: 134.975, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 118.85, name: "Dayton Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSGJ": [
    { type: "ATIS", valueMHz: 119.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.175, name: "Ground" },
    { type: "TWR", valueMHz: 127.625, name: "Tower" },
    { type: "APP", valueMHz: 120.75, name: "Jacksonville Approach" },
    { type: "CTAF", valueMHz: 127.625, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSGR": [
    { type: "ASOS", valueMHz: 118.125, name: "ASOS" },
    { type: "GND", valueMHz: 121.4, name: "Ground" },
    { type: "TWR", valueMHz: 118.65, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Houston Approach" },
    { type: "CTAF", valueMHz: 118.65, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSGU": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "DEL", valueMHz: 133.3, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSHD": [
    { type: "AWOS", valueMHz: 124.925, name: "AWOS" },
    { type: "APP", valueMHz: 132.85, name: "Potomac Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KSHR": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KSHV": [
    { type: "ATIS", valueMHz: 128.45, name: "ATIS" },
    { type: "DEL", valueMHz: 124.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.4, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSJC": [
    { type: "ATIS", valueMHz: 126.95, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 124, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 124, name: "CTAF" }
  ],
  "KSJT": [
    { type: "ATIS", valueMHz: 128.45, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSKA": [
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 126.2, name: "Tower" },
    { type: "APP", valueMHz: 123.75, name: "Spokane Approach" }
  ],
  "KSKF": [
    { type: "ATIS", valueMHz: 120.45, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 118.05, name: "San Antonio Approach" }
  ],
  "KSKX": [
    { type: "AWOS", valueMHz: 132.975, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSLC": [
    { type: "ATIS", valueMHz: 124.75, name: "ATIS" },
    { type: "DEL", valueMHz: 127.3, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSLE": [
    { type: "ATIS", valueMHz: 124.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "CTAF", valueMHz: 119.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSLI": [
    { type: "GND", valueMHz: 126.95, name: "Ground" },
    { type: "TWR", valueMHz: 123.85, name: "Tower" },
    { type: "APP", valueMHz: 124.65, name: "SoCal Approach" }
  ],
  "KSLK": [
    { type: "ASOS", valueMHz: 124.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KSLN": [
    { type: "ATIS", valueMHz: 120.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSME": [
    { type: "AWOS", valueMHz: 124.85, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSMF": [
    { type: "ATIS", valueMHz: 126.75, name: "ATIS" },
    { type: "DEL", valueMHz: 121.1, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.7, name: "Tower" },
    { type: "APP", valueMHz: 125.25, name: "NorCal Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSMN": [
    { type: "AWOS", valueMHz: 135.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSMO": [
    { type: "ATIS", valueMHz: 119.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 124.3, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSMX": [
    { type: "ATIS", valueMHz: 121.15, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 124.15, name: "Santa Barb Approach" },
    { type: "CTAF", valueMHz: 118.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSNA": [
    { type: "ATIS", valueMHz: 126, name: "ATIS" },
    { type: "DEL", valueMHz: 118, name: "Clearance Delivery" },
    { type: "DEL", valueMHz: 121.85, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 120.8, name: "Ground" },
    { type: "GND", valueMHz: 132.25, name: "Ground" },
    { type: "TWR", valueMHz: 119.9, name: "Tower" },
    { type: "TWR", valueMHz: 126.8, name: "Tower" },
    { type: "TWR", valueMHz: 128.35, name: "Tower" },
    { type: "APP", valueMHz: 121.3, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 126.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSNS": [
    { type: "ATIS", valueMHz: 124.85, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.4, name: "Tower" },
    { type: "APP", valueMHz: 127.15, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 119.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSNY": [
    { type: "ASOS", valueMHz: 118.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSOA": [
    { type: "AWOS", valueMHz: 118.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSOW": [
    { type: "AWOS", valueMHz: 118.075, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KSPI": [
    { type: "ATIS", valueMHz: 127.65, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Springfield Approach" },
    { type: "CTAF", valueMHz: 121.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 131.42, name: "UNICOM" }
  ],
  "KSPS": [
    { type: "ATIS", valueMHz: 132.05, name: "ATIS" },
    { type: "DEL", valueMHz: 121.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 125.5, name: "Ground" },
    { type: "TWR", valueMHz: 119.75, name: "Tower" },
    { type: "APP", valueMHz: 118.2, name: "Approach" },
    { type: "CTAF", valueMHz: 119.75, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSQL": [
    { type: "ATIS", valueMHz: 125.9, name: "ATIS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 119, name: "Tower" },
    { type: "APP", valueMHz: 133.95, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 119, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSRQ": [
    { type: "ATIS", valueMHz: 134.15, name: "ATIS" },
    { type: "ASOS", valueMHz: 134.15, name: "ASOS" },
    { type: "DEL", valueMHz: 118.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 119.65, name: "Tampa Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSRR": [
    { type: "AWOS", valueMHz: 126.475, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSSC": [
    { type: "ATIS", valueMHz: 132.125, name: "ATIS" },
    { type: "DEL", valueMHz: 121.8, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 126.1, name: "Ground" },
    { type: "TWR", valueMHz: 126.65, name: "Tower" },
    { type: "APP", valueMHz: 125.4, name: "Approach" }
  ],
  "KSSF": [
    { type: "ATIS", valueMHz: 128.8, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 125.7, name: "San Antonio Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSSI": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KSTC": [
    { type: "ATIS", valueMHz: 119.375, name: "ATIS" },
    { type: "ASOS", valueMHz: 118.25, name: "ASOS" },
    { type: "DEL", valueMHz: 118.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 118.25, name: "Tower" },
    { type: "CTAF", valueMHz: 123.5, name: "CTAF" }
  ],
  "KSTJ": [
    { type: "ATIS", valueMHz: 125.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 126.9, name: "Tower" },
    { type: "APP", valueMHz: 120.35, name: "St Joseph Approach" },
    { type: "CTAF", valueMHz: 126.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSTL": [
    { type: "ATIS", valueMHz: 125.025, name: "ATIS" },
    { type: "DEL", valueMHz: 119.5, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 118.925, name: "Ground" },
    { type: "GND", valueMHz: 121.65, name: "Ground" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "TWR", valueMHz: 120.05, name: "Tower" },
    { type: "TWR", valueMHz: 132.475, name: "Tower" },
    { type: "APP", valueMHz: 120.05, name: "St Louis Approach" },
    { type: "APP", valueMHz: 121.025, name: "Approach" },
    { type: "APP", valueMHz: 123.7, name: "Saint Louis Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSTP": [
    { type: "ATIS", valueMHz: 118.35, name: "ATIS" },
    { type: "TWR", valueMHz: 119.1, name: "Tower" },
    { type: "APP", valueMHz: 121.2, name: "Minneapolis Approach" },
    { type: "CTAF", valueMHz: 119.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSTS": [
    { type: "ATIS", valueMHz: 120.55, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 127.8, name: "NorCal Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSUN": [
    { type: "ATIS", valueMHz: 128.225, name: "ATIS" },
    { type: "AWOS", valueMHz: 128.225, name: "AWOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.6, name: "Tower" },
    { type: "CTAF", valueMHz: 125.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSUS": [
    { type: "ATIS", valueMHz: 134.8, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 122.6, name: "Tower" },
    { type: "APP", valueMHz: 126.5, name: "St Louis Approach" },
    { type: "CTAF", valueMHz: 124.75, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSUU": [
    { type: "DEL", valueMHz: 127.55, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.75, name: "Tower" },
    { type: "APP", valueMHz: 119.9, name: "Approach" },
    { type: "UNICOM", valueMHz: 123.3, name: "UNICOM" }
  ],
  "KSUX": [
    { type: "ATIS", valueMHz: 119.45, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 124.6, name: "Sioux City Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSVC": [
    { type: "AWOS", valueMHz: 126.725, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KSVN": [
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "APP", valueMHz: 118.4, name: "Savannah Approach" },
    { type: "CTAF", valueMHz: 133.55, name: "CTAF" }
  ],
  "KSWF": [
    { type: "ATIS", valueMHz: 124.575, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121, name: "Tower" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSWO": [
    { type: "ASOS", valueMHz: 135.725, name: "ASOS" },
    { type: "GND", valueMHz: 121.6, name: "Ground" },
    { type: "TWR", valueMHz: 125.35, name: "Tower" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KSYR": [
    { type: "ATIS", valueMHz: 132.05, name: "ATIS" },
    { type: "DEL", valueMHz: 125.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 126.125, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KSZL": [
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 128.275, name: "Ground" },
    { type: "TWR", valueMHz: 132.4, name: "Tower" },
    { type: "APP", valueMHz: 127.45, name: "Approach" }
  ],
  "KTBN": [
    { type: "ATIS", valueMHz: 118.7, name: "ATIS" },
    { type: "TWR", valueMHz: 125.4, name: "Tower" },
    { type: "CTAF", valueMHz: 125.4, name: "CTAF" }
  ],
  "KTCC": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTCL": [
    { type: "ASOS", valueMHz: 132.825, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "APP", valueMHz: 120.15, name: "Birmingham Approach" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTCM": [
    { type: "GND", valueMHz: 125.15, name: "Ground" },
    { type: "TWR", valueMHz: 124.8, name: "Tower" },
    { type: "APP", valueMHz: 126.5, name: "Seattle Approach" }
  ],
  "KTCS": [
    { type: "ASOS", valueMHz: 120.675, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KTEB": [
    { type: "ATIS", valueMHz: 132.025, name: "ATIS" },
    { type: "DEL", valueMHz: 128.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "TWR", valueMHz: 125.1, name: "Tower" },
    { type: "APP", valueMHz: 127.6, name: "New York Approach" }
  ],
  "KTEX": [
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KTIK": [
    { type: "DEL", valueMHz: 119.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.45, name: "Tower" },
    { type: "APP", valueMHz: 120.45, name: "Oke City Approach" }
  ],
  "KTIW": [
    { type: "ATIS", valueMHz: 124.05, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.5, name: "Tower" },
    { type: "APP", valueMHz: 120.1, name: "Seattle Approach" },
    { type: "CTAF", valueMHz: 118.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTIX": [
    { type: "ATIS", valueMHz: 120.625, name: "ATIS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 134.95, name: "Orlando Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTLH": [
    { type: "ATIS", valueMHz: 119.45, name: "ATIS" },
    { type: "DEL", valueMHz: 126.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 128.7, name: "Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTMB": [
    { type: "ATIS", valueMHz: 124, name: "ATIS" },
    { type: "DEL", valueMHz: 133, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "APP", valueMHz: 125.5, name: "Miami Approach" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" }
  ],
  "KTOI": [
    { type: "ATIS", valueMHz: 120.925, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 124.3, name: "Tower" },
    { type: "APP", valueMHz: 121.1, name: "Cairns Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KTOL": [
    { type: "ATIS", valueMHz: 118.75, name: "ATIS" },
    { type: "DEL", valueMHz: 121.75, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 123.975, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTOP": [
    { type: "ASOS", valueMHz: 121.275, name: "ASOS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTPA": [
    { type: "ATIS", valueMHz: 126.45, name: "ATIS" },
    { type: "DEL", valueMHz: 133.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 118.15, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTPH": [
    { type: "ASOS", valueMHz: 118.875, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KTPL": [
    { type: "AWOS", valueMHz: 134.975, name: "AWOS" },
    { type: "DEL", valueMHz: 125.9, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 120.075, name: "Gray Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KTRI": [
    { type: "ATIS", valueMHz: 118.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 119.25, name: "Approach" },
    { type: "CTAF", valueMHz: 119.5, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTRK": [
    { type: "AWOS", valueMHz: 118, name: "AWOS" },
    { type: "GND", valueMHz: 118.3, name: "Ground" },
    { type: "TWR", valueMHz: 120.575, name: "Tower" },
    { type: "CTAF", valueMHz: 120.575, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KTRM": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "APP", valueMHz: 135.275, name: "Palm Springs Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KTTD": [
    { type: "ASOS", valueMHz: 135.625, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 118.1, name: "Portland Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTTN": [
    { type: "ATIS", valueMHz: 126.775, name: "ATIS" },
    { type: "ASOS", valueMHz: 126.775, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Philadelphia Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTTS": [
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 128.55, name: "Tower" },
    { type: "APP", valueMHz: 134.95, name: "Orlando Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "KTUL": [
    { type: "ATIS", valueMHz: 124.9, name: "ATIS" },
    { type: "DEL", valueMHz: 134.05, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTUP": [
    { type: "ASOS", valueMHz: 133.525, name: "ASOS" },
    { type: "GND", valueMHz: 121.825, name: "Ground" },
    { type: "TWR", valueMHz: 118.775, name: "Tower" },
    { type: "CTAF", valueMHz: 118.775, name: "CTAF" }
  ],
  "KTUS": [
    { type: "ATIS", valueMHz: 123.8, name: "ATIS" },
    { type: "DEL", valueMHz: 126.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 124.4, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.4, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTVC": [
    { type: "ATIS", valueMHz: 119.175, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 124.2, name: "Tower" },
    { type: "CTAF", valueMHz: 124.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTVF": [
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KTVL": [
    { type: "ASOS", valueMHz: 124.725, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.85, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.85, name: "UNICOM" }
  ],
  "KTWF": [
    { type: "ASOS", valueMHz: 135.025, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 126.7, name: "Twin Falls Approach" },
    { type: "CTAF", valueMHz: 118.2, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTXK": [
    { type: "ATIS", valueMHz: 120.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.7, name: "Tower" },
    { type: "CTAF", valueMHz: 125.7, name: "CTAF" }
  ],
  "KTYR": [
    { type: "ATIS", valueMHz: 126.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 120.1, name: "Tower" },
    { type: "APP", valueMHz: 128.75, name: "Longview Approach" },
    { type: "CTAF", valueMHz: 120.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KTYS": [
    { type: "ATIS", valueMHz: 128.35, name: "ATIS" },
    { type: "DEL", valueMHz: 121.65, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 121.2, name: "Tower" },
    { type: "APP", valueMHz: 118, name: "Knoxville Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KUAO": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "DEL", valueMHz: 119.95, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 126, name: "Portland Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KUIN": [
    { type: "ASOS", valueMHz: 118.325, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KUKI": [
    { type: "ASOS", valueMHz: 119.275, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KUNV": [
    { type: "AWOS", valueMHz: 127.65, name: "AWOS" },
    { type: "DEL", valueMHz: 118.55, name: "Clearance Delivery" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KUOX": [
    { type: "AWOS", valueMHz: 132.725, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KUTS": [
    { type: "ASOS", valueMHz: 119.425, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KUUU": [
    { type: "ASOS", valueMHz: 132.075, name: "ASOS" },
    { type: "DEL", valueMHz: 127.25, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 128.7, name: "Providence Approach" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KVAD": [
    { type: "GND", valueMHz: 120.625, name: "Ground" },
    { type: "TWR", valueMHz: 128.45, name: "Tower" },
    { type: "APP", valueMHz: 119.525, name: "Valdosta Approach" }
  ],
  "KVBG": [
    { type: "ATIS", valueMHz: 133.125, name: "ATIS" },
    { type: "TWR", valueMHz: 124.95, name: "Tower" },
    { type: "APP", valueMHz: 124.15, name: "Santa Barb Approach" },
    { type: "CTAF", valueMHz: 124.95, name: "CTAF" }
  ],
  "KVCT": [
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KVEL": [
    { type: "ASOS", valueMHz: 135.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KVGT": [
    { type: "ATIS", valueMHz: 118.05, name: "ATIS" },
    { type: "ASOS", valueMHz: 118.05, name: "ASOS" },
    { type: "DEL", valueMHz: 124, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125.7, name: "Tower" },
    { type: "APP", valueMHz: 118.125, name: "Las Vegas Approach" },
    { type: "APP", valueMHz: 119.4, name: "Las Vegas Approach" },
    { type: "CTAF", valueMHz: 125.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KVIS": [
    { type: "AWOS", valueMHz: 119.925, name: "AWOS" },
    { type: "APP", valueMHz: 118.5, name: "Fresno Approach" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KVLD": [
    { type: "ASOS", valueMHz: 126.225, name: "ASOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.9, name: "Tower" },
    { type: "APP", valueMHz: 119.525, name: "Approach" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KVNY": [
    { type: "ATIS", valueMHz: 118.45, name: "ATIS" },
    { type: "DEL", valueMHz: 126.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 119.3, name: "Tower" },
    { type: "TWR", valueMHz: 120.2, name: "Tower" },
    { type: "APP", valueMHz: 120.4, name: "SoCal Approach" },
    { type: "CTAF", valueMHz: 119.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KVOK": [
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.5, name: "Tower" },
    { type: "APP", valueMHz: 135.25, name: "Approach" },
    { type: "CTAF", valueMHz: 127.5, name: "CTAF" }
  ],
  "KVPS": [
    { type: "ATIS", valueMHz: 134.625, name: "ATIS" },
    { type: "DEL", valueMHz: 127.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.2, name: "Tower" },
    { type: "APP", valueMHz: 125.1, name: "Approach" }
  ],
  "KVPZ": [
    { type: "ASOS", valueMHz: 125.875, name: "ASOS" },
    { type: "DEL", valueMHz: 135.2, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 132.05, name: "South Bend Approach" },
    { type: "CTAF", valueMHz: 122.725, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.725, name: "UNICOM" }
  ],
  "KVQQ": [
    { type: "ATIS", valueMHz: 125.275, name: "ATIS" },
    { type: "GND", valueMHz: 121.625, name: "Ground" },
    { type: "TWR", valueMHz: 126.1, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Jacksonville Approach" },
    { type: "CTAF", valueMHz: 126.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KVRB": [
    { type: "ATIS", valueMHz: 120.575, name: "ATIS" },
    { type: "DEL", valueMHz: 134.975, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 127.45, name: "Ground" },
    { type: "TWR", valueMHz: 126.3, name: "Tower" },
    { type: "CTAF", valueMHz: 126.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KVTN": [
    { type: "ASOS", valueMHz: 118.075, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KW63": [
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "KWJF": [
    { type: "ATIS", valueMHz: 126.3, name: "ATIS" },
    { type: "AWOS", valueMHz: 133.875, name: "AWOS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "APP", valueMHz: 126.1, name: "Joshua Approach" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KWMC": [
    { type: "ASOS", valueMHz: 120.175, name: "ASOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KWRB": [
    { type: "ATIS", valueMHz: 119.475, name: "ATIS" },
    { type: "GND", valueMHz: 121.85, name: "Ground" },
    { type: "TWR", valueMHz: 133.225, name: "Tower" },
    { type: "APP", valueMHz: 119.6, name: "Atlanta Approach" }
  ],
  "KWRI": [
    { type: "DEL", valueMHz: 135.2, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 118.65, name: "Tower" },
    { type: "APP", valueMHz: 124.15, name: "Approach" }
  ],
  "KWRL": [
    { type: "ASOS", valueMHz: 135.475, name: "ASOS" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "KWST": [
    { type: "ASOS", valueMHz: 132.375, name: "ASOS" },
    { type: "APP", valueMHz: 119.45, name: "Providence Approach" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KWWD": [
    { type: "AWOS", valueMHz: 118.275, name: "AWOS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "APP", valueMHz: 124.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "KWWR": [
    { type: "AWOS", valueMHz: 118.425, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KWYS": [
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "KX51": [
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KXMR": [
    { type: "TWR", valueMHz: 118.625, name: "Tower" },
    { type: "APP", valueMHz: 134.95, name: "Orlando Approach" }
  ],
  "KXNA": [
    { type: "ASOS", valueMHz: 119.425, name: "ASOS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 127.1, name: "Tower" },
    { type: "APP", valueMHz: 121, name: "Razorback Approach" },
    { type: "CTAF", valueMHz: 127.1, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KYIP": [
    { type: "ATIS", valueMHz: 127.425, name: "ATIS" },
    { type: "ASOS", valueMHz: 132.35, name: "ASOS" },
    { type: "GND", valueMHz: 121.75, name: "Ground" },
    { type: "TWR", valueMHz: 125.275, name: "Tower" },
    { type: "APP", valueMHz: 118.95, name: "Detroit Approach" }
  ],
  "KYKM": [
    { type: "ATIS", valueMHz: 125.25, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 133.25, name: "Tower" },
    { type: "APP", valueMHz: 123.8, name: "Chinook Approach" },
    { type: "CTAF", valueMHz: 133.25, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KYKN": [
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "KYNG": [
    { type: "ATIS", valueMHz: 123.75, name: "ATIS" },
    { type: "DEL", valueMHz: 118.25, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.5, name: "Tower" },
    { type: "APP", valueMHz: 127.15, name: "Approach" },
    { type: "APP", valueMHz: 133.95, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "KZZV": [
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "PAAQ": [
    { type: "ASOS", valueMHz: 134.75, name: "ASOS" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PABA": [
    { type: "CTAF", valueMHz: 126.2, name: "CTAF" }
  ],
  "PABE": [
    { type: "ATIS", valueMHz: 119.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" }
  ],
  "PABI": [
    { type: "ATIS", valueMHz: 132.075, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.65, name: "ASOS" },
    { type: "GND", valueMHz: 118.225, name: "Ground" },
    { type: "TWR", valueMHz: 125.325, name: "Tower" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PABR": [
    { type: "ASOS", valueMHz: 132.15, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PABV": [
    { type: "AWOS", valueMHz: 135.55, name: "AWOS" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "PACD": [
    { type: "ASOS", valueMHz: 135.75, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PACL": [
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PACV": [
    { type: "ASOS", valueMHz: 134.8, name: "ASOS" },
    { type: "APP", valueMHz: 133.6, name: "Anchorage Approach" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PADE": [
    { type: "ASOS", valueMHz: 135.5, name: "ASOS" },
    { type: "APP", valueMHz: 119.2, name: "Approach" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PADL": [
    { type: "ATIS", valueMHz: 125, name: "ATIS" },
    { type: "AWOS", valueMHz: 135.55, name: "AWOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PADQ": [
    { type: "ATIS", valueMHz: 135.5, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 119.8, name: "Tower" },
    { type: "APP", valueMHz: 125.1, name: "Approach" },
    { type: "CTAF", valueMHz: 119.8, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "PADU": [
    { type: "AWOS", valueMHz: 125.8, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.6, name: "CTAF" }
  ],
  "PAED": [
    { type: "ATIS", valueMHz: 124.3, name: "ATIS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 127.2, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Anchorage Approach" }
  ],
  "PAEH": [
    { type: "UNICOM", valueMHz: 126.2, name: "UNICOM" }
  ],
  "PAEI": [
    { type: "ASOS", valueMHz: 118.525, name: "ASOS" },
    { type: "GND", valueMHz: 121.8, name: "Ground" },
    { type: "TWR", valueMHz: 127.2, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Fairbanks Approach" }
  ],
  "PAEM": [
    { type: "AWOS", valueMHz: 135.35, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAEN": [
    { type: "ATIS", valueMHz: 133.35, name: "ATIS" },
    { type: "GND", valueMHz: 118.75, name: "Ground" },
    { type: "TWR", valueMHz: 121.3, name: "Tower" },
    { type: "CTAF", valueMHz: 121.3, name: "CTAF" }
  ],
  "PAFA": [
    { type: "ATIS", valueMHz: 124.4, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.025, name: "ASOS" },
    { type: "DEL", valueMHz: 127.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 118.6, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PAFB": [
    { type: "ATIS", valueMHz: 134.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 125, name: "Tower" },
    { type: "APP", valueMHz: 125.35, name: "Fairbanks Approach" },
    { type: "CTAF", valueMHz: 125, name: "CTAF" }
  ],
  "PAFE": [
    { type: "AWOS", valueMHz: 135.25, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAFM": [
    { type: "AWOS", valueMHz: 132.1, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" }
  ],
  "PAGA": [
    { type: "AWOS", valueMHz: 132.525, name: "AWOS" },
    { type: "CTAF", valueMHz: 123, name: "CTAF" }
  ],
  "PAGK": [
    { type: "ASOS", valueMHz: 134.85, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAGM": [
    { type: "AWOS", valueMHz: 125.9, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" }
  ],
  "PAGS": [
    { type: "AWOS", valueMHz: 125.9, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.5, name: "CTAF" }
  ],
  "PAHL": [
    { type: "AWOS", valueMHz: 135.75, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAHN": [
    { type: "ASOS", valueMHz: 135.75, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAHO": [
    { type: "ASOS", valueMHz: 135.65, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123.05, name: "UNICOM" }
  ],
  "PAII": [
    { type: "AWOS", valueMHz: 135.65, name: "AWOS" },
    { type: "APP", valueMHz: 124.8, name: "Approach" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAIK": [
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" }
  ],
  "PAIL": [
    { type: "ATIS", valueMHz: 134.95, name: "ATIS" },
    { type: "ASOS", valueMHz: 134.95, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PAIM": [
    { type: "CTAF", valueMHz: 126.2, name: "CTAF" }
  ],
  "PAJN": [
    { type: "ATIS", valueMHz: 135.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PAKN": [
    { type: "ATIS", valueMHz: 128.8, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "CTAF", valueMHz: 121.9, name: "CTAF" }
  ],
  "PAKP": [
    { type: "AWOS", valueMHz: 135.75, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAKT": [
    { type: "ATIS", valueMHz: 119.9, name: "ATIS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PAKW": [
    { type: "ASOS", valueMHz: 135.45, name: "ASOS" },
    { type: "CTAF", valueMHz: 120.9, name: "CTAF" }
  ],
  "PALU": [
    { type: "UNICOM", valueMHz: 126.2, name: "UNICOM" }
  ],
  "PAMR": [
    { type: "ATIS", valueMHz: 124.25, name: "ATIS" },
    { type: "GND", valueMHz: 121.7, name: "Ground" },
    { type: "TWR", valueMHz: 126, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Anchorage Approach" },
    { type: "CTAF", valueMHz: 126, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PAMY": [
    { type: "AWOS", valueMHz: 123.9, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PANC": [
    { type: "ATIS", valueMHz: 118.4, name: "ATIS" },
    { type: "DEL", valueMHz: 119.4, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.3, name: "Tower" },
    { type: "APP", valueMHz: 119.1, name: "Approach" },
    { type: "APP", valueMHz: 123.8, name: "Approach" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PANN": [
    { type: "ASOS", valueMHz: 125.2, name: "ASOS" },
    { type: "APP", valueMHz: 125.35, name: "Fairbanks Approach" },
    { type: "CTAF", valueMHz: 122.1, name: "CTAF" }
  ],
  "PANT": [
    { type: "ASOS", valueMHz: 135.75, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PANV": [
    { type: "AWOS", valueMHz: 133.55, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "PAOM": [
    { type: "ATIS", valueMHz: 119.925, name: "ATIS" },
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PAOR": [
    { type: "ASOS", valueMHz: 135.4, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" }
  ],
  "PAOT": [
    { type: "ATIS", valueMHz: 135.45, name: "ATIS" },
    { type: "ASOS", valueMHz: 135.45, name: "ASOS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "PAPB": [
    { type: "ASOS", valueMHz: 135.45, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAPC": [
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "PAPG": [
    { type: "AWOS", valueMHz: 125.8, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.5, name: "CTAF" }
  ],
  "PAPH": [
    { type: "AWOS", valueMHz: 135.4, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAPM": [
    { type: "AWOS", valueMHz: 118.375, name: "AWOS" },
    { type: "APP", valueMHz: 127.6, name: "Approach" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAQT": [
    { type: "ASOS", valueMHz: 122.5, name: "ASOS" },
    { type: "APP", valueMHz: 119.4, name: "Approach" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PARC": [
    { type: "AWOS", valueMHz: 135.75, name: "AWOS" },
    { type: "APP", valueMHz: 135, name: "Approach" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PARY": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PASA": [
    { type: "AWOS", valueMHz: 121.3, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.7, name: "CTAF" }
  ],
  "PASC": [
    { type: "ATIS", valueMHz: 118.4, name: "ATIS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 123, name: "UNICOM" }
  ],
  "PASD": [
    { type: "AWOS", valueMHz: 134.85, name: "AWOS" },
    { type: "DEL", valueMHz: 122.3, name: "Clearance Delivery" },
    { type: "CTAF", valueMHz: 122.3, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "PASI": [
    { type: "ATIS", valueMHz: 135.9, name: "ATIS" },
    { type: "CTAF", valueMHz: 123.6, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PASN": [
    { type: "ASOS", valueMHz: 135.75, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.3, name: "CTAF" }
  ],
  "PASV": [
    { type: "UNICOM", valueMHz: 126.2, name: "UNICOM" }
  ],
  "PASX": [
    { type: "AWOS", valueMHz: 135.45, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.5, name: "CTAF" }
  ],
  "PASY": [
    { type: "ASOS", valueMHz: 135.65, name: "ASOS" },
    { type: "CTAF", valueMHz: 127.2, name: "CTAF" }
  ],
  "PATL": [
    { type: "UNICOM", valueMHz: 126.2, name: "UNICOM" }
  ],
  "PATQ": [
    { type: "ASOS", valueMHz: 119.925, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAUN": [
    { type: "AWOS", valueMHz: 132.25, name: "AWOS" },
    { type: "CTAF", valueMHz: 123, name: "CTAF" }
  ],
  "PAVD": [
    { type: "AWOS", valueMHz: 118.8, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAWD": [
    { type: "ASOS", valueMHz: 135.2, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PAWG": [
    { type: "AWOS", valueMHz: 128.5, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.6, name: "CTAF" }
  ],
  "PAWI": [
    { type: "ASOS", valueMHz: 132.25, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PAWS": [
    { type: "AWOS", valueMHz: 135.25, name: "AWOS" },
    { type: "APP", valueMHz: 119.1, name: "Anchorage Approach" },
    { type: "CTAF", valueMHz: 122.8, name: "CTAF" }
  ],
  "PFYU": [
    { type: "AWOS", valueMHz: 125.8, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.5, name: "CTAF" }
  ],
  "PHBK": [
    { type: "TWR", valueMHz: 126.2, name: "Tower" },
    { type: "UNICOM", valueMHz: 122.8, name: "UNICOM" }
  ],
  "PHHN": [
    { type: "APP", valueMHz: 126, name: "Approach" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PHJH": [
    { type: "AWOS", valueMHz: 118.525, name: "AWOS" },
    { type: "UNICOM", valueMHz: 122.7, name: "UNICOM" }
  ],
  "PHJR": [
    { type: "ATIS", valueMHz: 119.8, name: "ATIS" },
    { type: "DEL", valueMHz: 121.7, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 123.8, name: "Ground" },
    { type: "TWR", valueMHz: 132.6, name: "Tower" },
    { type: "APP", valueMHz: 118.3, name: "Honolulu Approach" },
    { type: "CTAF", valueMHz: 132.6, name: "CTAF" }
  ],
  "PHKO": [
    { type: "ATIS", valueMHz: 127.4, name: "ATIS" },
    { type: "DEL", valueMHz: 121.9, name: "Clearance Delivery" },
    { type: "TWR", valueMHz: 120.3, name: "Tower" },
    { type: "CTAF", valueMHz: 120.3, name: "CTAF" }
  ],
  "PHLI": [
    { type: "ATIS", valueMHz: 127.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.9, name: "Tower" },
    { type: "CTAF", valueMHz: 118.9, name: "CTAF" }
  ],
  "PHMK": [
    { type: "ATIS", valueMHz: 128.2, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 125.7, name: "Tower" },
    { type: "CTAF", valueMHz: 125.7, name: "CTAF" }
  ],
  "PHMU": [
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PHNG": [
    { type: "TWR", valueMHz: 120.7, name: "Tower" },
    { type: "APP", valueMHz: 125, name: "Approach" },
    { type: "CTAF", valueMHz: 120.7, name: "CTAF" }
  ],
  "PHNL": [
    { type: "ATIS", valueMHz: 127.9, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" }
  ],
  "PHNY": [
    { type: "ASOS", valueMHz: 118.375, name: "ASOS" },
    { type: "CTAF", valueMHz: 122.9, name: "CTAF" }
  ],
  "PHOG": [
    { type: "ATIS", valueMHz: 128.6, name: "ATIS" },
    { type: "DEL", valueMHz: 120.6, name: "Clearance Delivery" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.7, name: "Tower" },
    { type: "APP", valueMHz: 119.5, name: "Maui Approach" },
    { type: "CTAF", valueMHz: 118.7, name: "CTAF" },
    { type: "UNICOM", valueMHz: 122.95, name: "UNICOM" }
  ],
  "PHTO": [
    { type: "ATIS", valueMHz: 126.4, name: "ATIS" },
    { type: "GND", valueMHz: 121.9, name: "Ground" },
    { type: "TWR", valueMHz: 118.1, name: "Tower" },
    { type: "APP", valueMHz: 119.7, name: "Approach" },
    { type: "CTAF", valueMHz: 118.1, name: "CTAF" }
  ],
  "PPIZ": [
    { type: "AWOS", valueMHz: 135.65, name: "AWOS" },
    { type: "CTAF", valueMHz: 122.4, name: "CTAF" },
    { type: "UNICOM", valueMHz: 126.2, name: "UNICOM" }
  ]
};
