/**
 * Note: experimental for use with serve-pie#feature/open-api
 */

var _ = require('lodash');


exports.model = function(question, session, env) {

  console.debug('[state] question:', str(question));
  console.debug('[state] session:', str(session));
  console.debug('[state] env:', str(env));

  var base = {
    outcomes: [],
    config: initConfig(question)
  };

  if (session && _.isArray(session.value) && session.value.length > 0) {
    applyAnswersToSections(base.config.sections, session.value);
  } else {
    session.value = getDefaultAnswer(base.config);
  }

  if (env.mode === 'evaluate') {

    var allCorrect = _.isEqual(session.value, question.correctResponse);
    console.log('session.value: allCorrect', allCorrect, session.value, typeof(session.value), 'question.correctResponse: ', question.correctResponse, typeof(question.correctResponse));

    if (!allCorrect) {
      base.config.correctResponse = makeCorrectResponse(base.config.sections, question.correctResponse);
    }
    base.outcomes = createOutcomes(allCorrect);
    applyOutcomesToSections(base.config.sections, base.outcomes);
  }

  console.debug('[state] return: ' + str(base));
  return base;

  //--------------------------------------------

  function getDefaultAnswer(config){
    return _.map(config.sections, 'value')
  }

  function createOutcomes(allCorrect) {
    return _.map(session.value, function(v, index) {
      var correct = question.correctResponse[index] === v;
      var feedback = allCorrect ? null : lookup(question.feedback[v]);
      return {
        value: v,
        correct: correct,
        feedback: feedback
      };
    });
  }

  function lookup(value) {
    if (!value) {
      return undefined;
    }
    var localeKey = env.locale || (question.translations || {}).default_locale || 'en_US';
    var map = ((question.translations || {})[localeKey] || {});
    if (value.indexOf('$') === 0) {
      var key = value.substring(1);
      var out = map[key];
      if (!out) {
        console.warn('not able to find translation for: ', key);
      }
      return out || value;
    } else {
      return value;
    }
  }

  function initConfig(question) {
    var cfg = _.assign({}, question.model);
    cfg.disabled = env.mode && env.mode !== 'gather';
    cfg.prompt = lookup(cfg.prompt);
    cfg.sections = _.map(cfg.sections, function(c) {
      return {
        color: c.color,
        label: lookup(c.label),
        textClass:  '',
        value: c.value
      };
    });
    return cfg;
  }

  function applyAnswersToSections(sections, answers) {
    _.forEach(sections, function(s, index) {
      s.value = answers[index];
    });
  }

  function applyOutcomesToSections(sections, outcomes) {
    _.forEach(sections, function(s, index) {
      s.color = 'grey';
      s.textClass = outcomes[index].correct ? 'correct' : 'incorrect';
    });
  }

  function makeCorrectResponse(sections, response) {
    return _.map(sections, function(s, index){
      return {
        label: s.label,
        value: response[index],
        textClass: 'correct',
        color: 'grey'
      }
    });
  }

  function str(o) {
    return JSON.stringify(o, null, '  ');
  }

};