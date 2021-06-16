import { ServoStatus } from "./SocketManager"

export function servoStatusToString(state: ServoStatus) {
  switch (state) {
    case ServoStatus.DRAWING:
      return 'Tracé en cours'
    case ServoStatus.IDLING:
      return 'En attente'
    default:
      return 'Erreur'
  }
}