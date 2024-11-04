import socket
import threading
import cv2
import pickle
import struct

# Configurações do servidor
HOST = '127.0.0.1'  # IP do servidor
PORT = 12345        # Porta do servidor

# Lista de clientes conectados e bloqueio de threads para evitar conflitos
clients = []
clients_lock = threading.Lock()

# Gerenciamento de cada conexão de cliente
def handle_client(client_socket, client_address):
    # Solicita ao usuário que informe o nome
    client_socket.send(b'Please enter your name: ')
    user_name = client_socket.recv(1024).decode('utf-8').strip()

    with clients_lock:
        clients.append((client_socket, user_name))
    
    welcome_message = f'{user_name} has joined the chat.'
    broadcast(welcome_message.encode(), client_socket)
    print(welcome_message)

    try:
        while True:
            # Recebe mensagens do cliente
            message = client_socket.recv(1024)
            if not message:
                break
            if message.startswith(b'/cmd'):
                handle_command(message, client_socket, user_name)
            else:
                broadcast(f"{user_name}: {message.decode()}".encode(), client_socket)
    except Exception as e:
        print(f'Error handling client {client_address}: {e}')
    finally:
        with clients_lock:
            clients.remove((client_socket, user_name))
        client_socket.close()
        print(f'{user_name} has disconnected.')
        broadcast(f'{user_name} has left the chat.'.encode(), client_socket)

# Enviar mensagens para todos os clientes
def broadcast(message, sender_socket):
    with clients_lock:
        for client, _ in clients:
            if client != sender_socket:
                client.send(message)

# Gerenciar comandos especiais (e.g., comandos remotos, Easter Eggs)
def handle_command(command, client_socket, sender_name):
    # Simples tratamento de exemplo
    # command format: /cmd <user_name> <command>
    command_parts = command.decode().split()
    if len(command_parts) >= 3:
        target_name, cmd = command_parts[1], " ".join(command_parts[2:])
        target_socket = find_client_by_name(target_name)
        if target_socket:
            target_socket.send(f"{sender_name} requests: {cmd}".encode())
        else:
            client_socket.send(f"User {target_name} not found.".encode())

# Função para localizar cliente pelo nome
def find_client_by_name(name):
    with clients_lock:
        for client, client_name in clients:
            if client_name == name:
                return client
    return None

# Compartilhamento de vídeo usando OpenCV
def webcam_stream():
    cap = cv2.VideoCapture(0)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Serialização do frame para enviar pela rede
        data = pickle.dumps(frame)
        message = struct.pack("Q", len(data)) + data
        with clients_lock:
            for client, _ in clients:
                client.sendall(message)
    cap.release()

# Inicialização do servidor e aceitação de múltiplas conexões
def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)
    print("Server started, waiting for connections...")
    
    # Thread separada para transmissão de webcam
    webcam_thread = threading.Thread(target=webcam_stream)
    webcam_thread.start()

    try:
        while True:
            client_socket, client_address = server_socket.accept()
            print(f"Connection from {client_address}")
            client_thread = threading.Thread(target=handle_client, args=(client_socket, client_address))
            client_thread.start()
    except KeyboardInterrupt:
        print("Server shutting down...")
    finally:
        server_socket.close()

# Executa o servidor
if __name__ == "__main__":
    start_server()
