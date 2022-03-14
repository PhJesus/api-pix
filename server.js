"use strict";

import express from 'express';
import axios from 'axios';
import qs from 'qs';
import 'dotenv/config';
import expressLayouts from 'express-ejs-layouts';

// Variaveis p/ rodar o servidor
const app = express();
const PORT = 8080;

// PATHs e Layouts
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', '../views/layout.ejs');
app.set('view engine', 'ejs');

// Requests para a API
function getToken() {
  let data = qs.stringify({
    'grant_type': 'client_credentials',
    'scope': 'cob.read cob.write pix.read pix.write cobrancas.boletos-requisicao cobrancas.boletos-info'
  });
  let config = {
    method: 'post',
    url: `https://oauth.hm.bb.com.br/oauth/token?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: {
      'Authorization': "Basic ZXlKcFpDSTZJak15WVRrd05HSXRNRFEyTUMwME5HUmhMVGd5T0dRdFkyWXpOU0lzSW1OdlpHbG5iMUIxWW14cFkyRmtiM0lpT2pBc0ltTnZaR2xuYjFOdlpuUjNZWEpsSWpveU9Ea3lOaXdpYzJWeGRXVnVZMmxoYkVsdWMzUmhiR0ZqWVc4aU9qRjk6ZXlKcFpDSTZJbUl6TVRrM05qVXRaRGt3WkMwMFlqSTRMV0prWWpJdFpHUXdObUZqTlRreElpd2lZMjlrYVdkdlVIVmliR2xqWVdSdmNpSTZNQ3dpWTI5a2FXZHZVMjltZEhkaGNtVWlPakk0T1RJMkxDSnpaWEYxWlc1amFXRnNTVzV6ZEdGc1lXTmhieUk2TVN3aWMyVnhkV1Z1WTJsaGJFTnlaV1JsYm1OcFlXd2lPakVzSW1GdFltbGxiblJsSWpvaWFHOXRiMnh2WjJGallXOGlMQ0pwWVhRaU9qRTJORE0zTmpBNE1EQTJNREI5",
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'JSESSIONID=jHP_g9Izc8-ScnMsFgV8SVxg1MqYkvwdj_YLGuDMfgnKfrvKXBcs!133082940'
    },
    data: data
  };
  return new Promise((resolve, rejects) => {
    axios(config)
      .then((res) => {
        resolve(res.data);
      },
        (error) => {
          rejects(error.response);
        });
  });
};

async function criarPix() {
  let token = await getToken();
  console.log('Token gerado com sucesso!')
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
  let config = {
    method: 'PUT',
    url: `https://api.hm.bb.com.br/pix/v1/cobqrcode/?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Content-Type': 'application/json'
    },
    data: data
  }
  return new Promise((resolve, rejects) => {
    axios(config)
      .then(function (response) {
        let dados = [];
        dados.push(response.data);
        resolve(dados);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

async function consultarPix(txid) {
  let token = await getToken();
  console.log('Token gerado com sucesso!');
  let config = {
    method: 'get',
    url: `https://api.hm.bb.com.br/pix/v1/cob/${txid}?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Content-Type': 'application/json'
    }
  };
  return new Promise((resolve, rejects) => {
    axios(config)
      .then(function (response) {
        let dados = []
        dados.push(response.data);
        resolve(dados);
      },
        (error) => {
          rejects(error);
        });
  });
};

async function revisarPix(txid) {
  let token = await getToken();
  let data = JSON.stringify({
    "status": "REMOVIDA_PELO_USUARIO_RECEBEDOR"
  });
  var config = {
    method: 'get',
    url: `https://api.hm.bb.com.br/pix/v1/cob/${txid}?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: {
      'Authorization': `${token.token_type} ${token.access_token}`,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return new Promise((resolve, rejects) => {
    axios(config)
      .then(function (response) {
        let dados = [];
        dados.push(response.data);
        resolve(dados);
      },
        (error) => {
          rejects(error);
        });
  });
};

async function gerenciarPix(dataInicial, dataFinal) {
  let token = await getToken();
  let config = {
    method: 'get',
    url: `https://api.hm.bb.com.br/pix/v1/?inicio=${dataInicial}&fim=${dataFinal}&paginacao.paginaAtual=1&gw-dev-app-key=${process.env.GW_DEVKEY}`,
    headers: {
      'Authorization': `${token.token_type} ${token.access_token}`
    }
  };

  return new Promise((resolve, rejects) => {
    axios(config)
      .then(function (response) {
        resolve(response.data.pix);
      },
        (error) => {
          rejects(error);
        });
  });
};

async function gerarPixBoleto(codBoleto) {
  let token = await getToken();
  let data = JSON.stringify({
    "numeroConvenio": 3128557
  });
  let config = {
    method: 'post',
    url: `https://api.hm.bb.com.br/cobrancas/v2/boletos/${codBoleto}/gerar-pix?gw-dev-app-key=${process.env.GW_DEVKEY}`,
    data: data,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token.token_type} ${token.access_token}`
    }
  };

  return new Promise((resolve, rejects) => {
    axios(config)
      .then(function (response) {
        console.log(response.data);
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
};

// HOME
app.get('', (req, res) => {
  res.render('home');
});

// CRIAR COBRANÇA PIX
app.get('/criarcob', async (req, res) => {
  let dados = await criarPix();
  res.render('criarcob', { dados: dados });
});

// CONSULTAR UM PIX UNICO
app.get('/consultarcob', async (req, res) => {
  let txid = 'i4D1AaKBPjYq399f3TsvPhFfEQPWFx0mmSp';
  let dados = await consultarPix(txid);
  res.render('consultarcob', { dados: dados });
});

// REVISAR COBRANÇAS
app.get('/revisarcob', async (req, res) => {
  let txid = 'i4D1AaKBPjYq399f3TsvPhFfEQPWFx0mmSp';
  let dados = await revisarPix(txid);

  res.render('revisarcob', { dados: dados });
});

// GERENCIAR PIX RECEBIDOS
app.get('/gerenciarcob', async (req, res) => {
  let dataInicial = '2022-02-23T00:00:00Z';
  let dataFinal = '2022-02-24T23:59:59Z';
  let dados = await gerenciarPix(dataInicial, dataFinal);
  console.log(dados);
  res.render('gerenciarcob', { dados: dados },);
});

// GERAR PIX APARTIR DE UM BOLETO
app.get('/gerarPixBoleto', async (req, res) => {
  let codBoleto = "00031285570000301899";
  let dados = await gerarPixBoleto(codBoleto);
  console.log(dados);
});

app.listen(PORT, () => console.log(`Servidor iniciado em localhost:${PORT}`))