# Chat com Comandos Remotos e Transmissão de Webcam

Este projeto é composto por um servidor em Python e um cliente em Node.js, criando um sistema de chat com suporte para comandos remotos e transmissão de vídeo da webcam. Usuários conectados ao servidor podem enviar mensagens entre si e executar comandos remotos em outros usuários.

## Funcionalidades

- **Chat entre clientes**: Envio de mensagens em tempo real entre os usuários conectados.
- **Comandos remotos**: Comandos como "invert mouse", "restrict mouse", "shutdown monitor" e "open webcam" podem ser enviados de um cliente a outro.
- **Transmissão de vídeo da webcam**: O servidor transmite frames da webcam em tempo real para os clientes conectados.

## Arquivos do Projeto

- **server.py**: Código do servidor que gerencia a conexão dos clientes, comandos e a transmissão de vídeo.
- **client.js**: Código do cliente em Node.js que permite ao usuário se conectar ao servidor, enviar mensagens, comandos e responder a solicitações.

## Pré-requisitos

### Servidor
- Python 3.x
- OpenCV (`pip install opencv-python`)
- Socket e threading (incluídos na instalação padrão do Python)

### Cliente
- Node.js
- Bibliotecas Node.js (`net`, `readline`, `robotjs`, `child_process`, `node-webcam`)

Para instalar as dependências do cliente, navegue até a pasta do projeto e execute:
```bash
npm install net readline robotjs node-webcam
