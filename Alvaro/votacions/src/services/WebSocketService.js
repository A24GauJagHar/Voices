import { useAppStore } from '@/stores/app';

class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connection established');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 Votos recibidos del servidor:', data);
          
          // Obtenemos el store y actualizamos los votos
          const store = useAppStore();
          store.setVotos(data);
        } catch (error) {
          console.error('❌ Error al procesar mensaje del servidor:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('🔌 WebSocket connection closed');
        
        // Intentar reconectar si no hemos superado el límite
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), 3000);
        } else {
          console.error('❌ No se pudo reconectar después de varios intentos');
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket:', error);
    }
  }

  sendVote(optionIndex) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Enviamos el índice como string para que coincida con las claves del JSON del servidor
      const voteMessage = optionIndex.toString();
      console.log('📤 Enviando voto:', voteMessage);
      this.socket.send(voteMessage);
    } else {
      console.error('❌ WebSocket no está conectado. Estado:', this.socket?.readyState);
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Cerrando conexión WebSocket...');
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketService;