/* eslint-disable  func-names */
/* eslint quote-props: ['error', 'consistent']*/

/**
 * What about Brazil
 * Application based on nodejs skill development kit.
 **/
'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.fe224f06-f8ad-4279-bc27-9f7a53144f8a';

const handlers = {
  'LaunchRequest': function launch() {
    this.emit('GetFact');
  },
  'GetNewFactIntent': function intent() {
    this.emit('GetFact');
  },
  'GetFact': function fact() {
    // Get a random space fact from the space facts list
    // Use this.t() to get corresponding language data
    const factArr = this.t('FACTS');
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];

    // Create speech output
    const speechOutput = this.t('GET_FACT_MESSAGE') + randomFact + this.t('OUT_FACT_MESSAGE');
    this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), randomFact);
  },
  'AMAZON.HelpIntent': function help() {
    const speechOutput = this.t('HELP_MESSAGE');
    const reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function cancel() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function stop() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

exports.handler = function handle(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;

  const request = require('request');
  const cheerio = require('cheerio');
  sourceData = 'http://agenciadenoticias.ibge.gov.br/en/agencia-news.html';

  request(sourceData, function call(error, response, body) {
    let facts = [];
    let news = '';
    let $ = '';
    let document;
    let languageStrings = {
      'en': {
        translation: {
          FACTS: [
            'What about Brazil is not available at the moment, try again later.',
          ],
          SKILL_NAME: 'What about Brazil',
          GET_FACT_MESSAGE: 'In Brazil this week: ',
          OUT_FACT_MESSAGE: 'That is it, for more updates about Brazil just ask: What about Brazil.',
          HELP_MESSAGE: 'You can say tell me what about Brazil, or, you can say exit... What can I help you with?',
          HELP_REPROMPT: 'What can I help you with?',
          STOP_MESSAGE: 'Bye.',
        },
      },
    };

    if (error) {
      return;
    }
    // Check status code (200 is HTTP OK)
    if (response.statusCode === 200) {
    // Parse the document body
      $ = cheerio.load( body );
      facts = [];
      factsList = '';
      news = '';

      $('.lista-noticias__texto').each(function() {
        document = $(this);
        news = document.text().trim();
        news = news.replace('[Retratos]', '');
        news = news.replace('\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t', ' ');
        facts.push(news);
      });

      languageStrings.en.translation.FACTS = facts;
      alexa.resources = languageStrings;
      alexa.registerHandlers(handlers);
      alexa.execute();
    }
  });
};
