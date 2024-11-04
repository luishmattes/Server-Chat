const net = require('net');
const readline = require('readline');
const robot = require('robotjs');
const { exec } = require('child_process');
const NodeWebcam = require('node-webcam');

// Configurações do servidor
const HOST = '127.0.0.1'; // IP do servidor
const PORT = 12345;       // Porta do servidor

// Interface de terminal para interações do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let clientName;

// Conexão com o servidor
const client = net.createConnection({ host: HOST, port: PORT }, () => {
  console.log('Connected to server.');
  requestUserName(); 
});

// Solicita o nome do usuário
function requestUserName() {
  rl.question('Enter your name: ', (name) => {
    clientName = name;
    client.write(name); // Envia o nome para o servidor
    console.log(`Welcome, ${name}!`);
    showMainMenu(); // Exibe o menu principal após o login
  });
}

// Recepção de dados do servidor
client.on('data', (data) => {
  const message = data.toString();

  
  if (!clientName) {
    return; 
  }

  // Processa as mensagens do servidor
  if (message.includes('requests:')) {
    console.log(`\nServer: ${message}`);
    executeCommand(message); 
    return; 
  }
  
  console.log(`\nServer: ${message}`);
});

// Se houver erros de conexão
client.on('error', (err) => {
  console.error(`Connection error: ${err.message}`);
});

// Exibe o menu principal
function showMainMenu() {
  console.log(`\nMenu Principal:
  1. Enviar Mensagem
  2. Executar Comando
  3. Sair
  `);
  rl.question('Escolha uma opção (1-3): ', handleMenuChoice);
}
// retornos do menu
function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      rl.question('Digite sua mensagem: ', (message) => {
        client.write(message); // Envia a mensagem para o servidor
        console.log('Mensagem enviada!');
        showMainMenu(); // Retorna ao menu após enviar a mensagem
      });
      break;
    case '2':
      showAvailableCommands(); // Exibe os comandos disponíveis
      break;
    case '3':
      client.end(); // Desconecta do servidor
      break;
    default:
      console.log('Opção inválida! Tente novamente.');
      showMainMenu(); // Retorna ao menu e exibe as opções novamente
  }
}

// Exibe os comandos disponíveis
function showAvailableCommands() {
  console.log(`
  Comandos Disponíveis:\n
  1. invert mouse - Inverter o movimento do mouse.
  2. restrict mouse - Restringir o movimento do mouse a uma área específica.
  3. shutdown monitor - Desligar o monitor.
  4. open webcam - Abrir a webcam.

  /cmd {destinatário} {comando} - Enviar um comando a um cliente específico.
  Ex: /cmd Alice invert mouse
  `);
  rl.question('Digite seu comando: ', handleCommandInput);
}

// Lida com a entrada de comandos
function handleCommandInput(input) {
  // Verifica se é um comando de /cmd
  if (input.startsWith('/cmd ')) {
    client.write(input); // Envia o comando para o servidor
    console.log(`Comando enviado: ${input}`);
  } else {
    console.log('Comando inválido! Tente novamente.');
  }
  showMainMenu(); // Retorna ao menu
}

// Executa o comando recebido
function executeCommand(command) {
  const parts = command.split(' '); // Divide a mensagem em partes
  const userCommand = parts.slice(2).join(' '); // Pega o comando após o 'requests:'
  
  switch (userCommand) {
    case 'invert mouse':
      invertMouse();
      break;
    case 'restrict mouse':
      restrictMouse();
      break;
    case 'shutdown monitor':
      shutdownMonitor();
      break;
    case 'open webcam':
      openWebcam();
      break;
    default:
      console.log('Comando desconhecido recebido.');
  }
}

// Funções para os Easter Eggs
function invertMouse() {
  console.log('Mouse invertido. Pressione Ctrl+C para parar.');
  setInterval(() => {
    const mouse = robot.getMousePos();
    const screenSize = robot.getScreenSize();
    const invertedX = screenSize.width - mouse.x;
    const invertedY = screenSize.height - mouse.y;
    robot.moveMouse(invertedX, invertedY);
  }, 100);
}

function restrictMouse() {
  const region = { x: 100, y: 100, width: 400, height: 400 };
  console.log('Mouse restrito a uma área. Pressione Ctrl+C para parar.');
  setInterval(() => {
    let mouse = robot.getMousePos();
    if (mouse.x < region.x || mouse.x > region.x + region.width ||
        mouse.y < region.y || mouse.y > region.y + region.height) {
      robot.moveMouse(region.x + region.width / 2, region.y + region.height / 2);
    }
  }, 100);
}

function shutdownMonitor() {
  exec('xset dpms force off', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao desligar o monitor: ${error.message}`);
    } else {
      console.log('Monitor desligado.');
    }
  });
}

function openWebcam() {
  console.log('Abrindo a webcam...');
  
  NodeWebcam.capture("webcam_image", {}, function(err, data) {
    if (err) {
      console.error('Erro ao abrir a webcam: ', err);
    } else {
      console.log('Webcam aberta com sucesso! Veja a imagem gerada.');
    }
  });
}

client.on('end', () => {
  console.log('Disconnected from server.');
});
