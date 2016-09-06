require('should');
var processing = require('./controller');

console.debug = function(){}

describe('processing', function () {

  describe('model', function () {

    describe('locale', function () {

      var question = {
        translations: {
          en_US: {
            PROMPT: 'en_US Prompt',
            LABEL: 'en_US Label',
            FB_ONE: 'en_US feedback one'
          }
        },
        correctResponse: ['two'],
        feedback: {
          one: '$FB_ONE'
        },
        model: {
          prompt: '$PROMPT',
          choices: [
            { label: '$LABEL', value: 'one' },
            { label: 'no lookup', value: 'two' },
            { label: '$NOT_FOUND_LABEL', value: 'three'}
          ]

        }
      }

      var session = { value: ['one']};
      var model;

      beforeEach(function () {
        model = processing.model(question, session, { locale: 'en_US', mode: 'evaluate' });
      });
      
      it('looks up the locale for the prompt', function () {
        model.config.prompt.should.eql('en_US Prompt');
      });
      
      it('looks up the locale for a choice', function(){
        model.config.choices[0].label.should.eql('en_US Label');
      });
      
      it('skips the lookup if the choice does not start with a $', function(){
        model.config.choices[1].label.should.eql('no lookup');
      });
      
      it('returns the value if it starts with a $ but no translation is found', function(){
        model.config.choices[2].label.should.eql('$NOT_FOUND_LABEL');
      });

      it('sets the feedback', function(){
        model.outcomes[0].feedback.should.eql('en_US feedback one');
      });
    });
  })
});
