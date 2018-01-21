/* eslint-disable  func-names */
/* eslint quote-props: ['error', 'consistent']*/

/**
 * What about Brazil
 * Application based on nodejs skill development kit.
 **/
'use strict';

const Alexa = require('alexa-sdk');
const request = require('request');
const cheerio = require('cheerio');
const API_URL = 'http://agenciadenoticias.ibge.gov.br/en/agencia-news';
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

  request(API_URL, function call(error, response, body) {
    let facts = [];
    let news = '';
    let bigNews = '';
    let bundleNews = 0;
    let $ = '';
    let document;
    let languageStrings = {
      'en': {
        translation: {
          FACTS: [
            'Brazil\'s Economy Review is not available at the moment, try again later.',
          ],
          SKILL_NAME: 'Brazil Economy Review',
          GET_FACT_MESSAGE: 'In Brazil\'s Economy this week: ',
          OUT_FACT_MESSAGE: '. And that is it, for more updates and statistics about Brazil just ask: Brazil Economy Review.',
          HELP_MESSAGE: 'You can say: Brazil Economy Review, or, you can say exit... What can I help you with?',
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
      news = '';
      bigNews = '';
      bundleNews = 3;

      $('.lista-noticias__texto').each(function() {
        document = $(this);
        news = document.text().trim();
        news = news.replace('[Retratos]', '');
        news = news.replace('...', '');
        news = news.replace('\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t', ' ');

        if (bundleNews > 0) {
          if (bigNews !== '') {
            bigNews = bigNews + '. Also in Brazil\'s Economy this week: ' + news;
          } else {
            bigNews = news;
          }
          bundleNews -= 1;
        } else {
          facts.push(bigNews);
          bigNews = '';
          bundleNews = 3;
        }
      });

      languageStrings.en.translation.FACTS = facts;
      alexa.resources = languageStrings;
      alexa.registerHandlers(handlers);
      alexa.execute();
    }
  });
};
