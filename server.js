// Importação dos módulos que serão utilizados
import express from 'express';
import axios from 'axios';
import qs from 'qs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(await readFile(new URL('./serviceAccountKey.json', import.meta.url)));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.collection('teste').doc('token')

// Variaveis importantes
const app = express();
const PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Config
app.use(express.static('public'));
app.use('/css',express.static(__dirname + 'public/css'));
app.use('/img',express.static(__dirname + 'public/img'));

// Template engine
app.set('view engine', 'ejs');

// DESCOBRIR COMO TIRAR DATA DAQUI

function getToken() {
  let data = qs.stringify({
    'grant_type': 'client_credentials',
    'scope': 'cob.read cob.write pix.read pix.write' 
  });
  let config = {
    method: 'post',
    url: `https://oauth.hm.bb.com.br/oauth/token?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: { 
      'Authorization': `${process.env.AUTHORIZATION}`, 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Cookie': 'JSESSIONID=jHP_g9Izc8-ScnMsFgV8SVxg1MqYkvwdj_YLGuDMfgnKfrvKXBcs!133082940'
    },
    data : data
  };

  axios(config)
  .then((res) => res.data)
  .then((token) => {
    db.collection('teste').doc('token').set(token)
  })
  .catch((error) => res.statusCode(500).json({ err: err.message}));
};

app.get('', (req, res) => {
  res.render('index');
});

// CRIAR COBRANÇA PIX
app.get('/criarcob', (req, res) => {
  let data = JSON.stringify({
    "calendario": {
      "expiracao": "36000"
    },
    "devedor": {
      "cpf": "12345678909",
      "nome": "Francisco da Silva"
    },
    "valor": {
      "original": "130.44"
    },
    "chave": "7f6844d0-de89-47e5-9ef7-e0a35a681615",
    "solicitacaoPagador": "Cobrança dos serviços prestados."
  });    
  getToken()
  db.collection('teste').doc('token').get()
    .then(doc => {
      let config = {
        method: 'put',
        url: `https://api.hm.bb.com.br/pix/v1/cob/?gw-dev-app-key=${process.env.GW_DEVKEY}`,
        headers: { 
          'Authorization': `${doc.data().token_type} ${doc.data().access_token}`, 
          'Content-Type': 'application/json'
        },
        data : data
      };

      axios(config)
      .then(function (response) {
        let dados = []
        dados.push(response.data)
        console.log(dados);
      })
      .catch(function (error) {
        console.log(error);
      });
    });
});

// CONSULTAR UM PIX UNICO
app.get('/consultarcob', (req, res) => {
  getToken();
  db.collection('teste').doc('token').get()
    .then(doc => {
      let txid = 'i4D1AaKBPjYq399f3TsvPhFfEQPWFx0mmSp';

      var config = {
        method: 'get',
        url: `https://api.hm.bb.com.br/pix/v1/cob/${txid}?gw-dev-app-key=${process.env.GW_DEVKEY}`,
        headers: { 
          'Authorization': `${doc.data().token_type} ${doc.data().access_token}`, 
          'Content-Type': 'application/json'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    });
});

// REVISAR COBRANÇAS
app.get('/revisarcob', (req, res) => {
  getToken();
  var data = JSON.stringify({
    "status": "REMOVIDA_PELO_USUARIO_RECEBEDOR"
  });
  db.collection('teste').doc('token').get()
    .then(doc => {
      let txid = 'i4D1AaKBPjYq399f3TsvPhFfEQPWFx0mmSp';

      var config = {
        method: 'get',
        url: `https://api.hm.bb.com.br/pix/v1/cob/${txid}?gw-dev-app-key=${process.env.GW_DEVKEY}`,
        headers: { 
          'Authorization': `${doc.data().token_type} ${doc.data().access_token}`, 
          'Content-Type': 'application/json'
        },
        data: data
      };
      
      axios(config)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    });
});

// GERENCIAR PIX RECEBIDOS
app.get('/gerenciarcob', (req, res) => {
  db.collection('teste').doc('token').get()
    .then(doc => {
      let config = {
        method: 'get',
        url: `https://api.hm.bb.com.br/pix/v1/?inicio=2022-02-23T00:00:00Z&fim=2022-02-24T23:59:59Z&paginacao.paginaAtual=1&${process.env.GW_DEVKEY}`,
        headers: { 
          'Authorization': `${doc.data().token_type} ${doc.data().access_token}`
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log(response.data.pix);
      })
      .catch(function (error) {
        console.log(error);
      });
    });
  
});
  
// GERAR QR CODE

app.listen(PORT, () => console.log(`Servidor iniciado em localhost:${PORT}`))