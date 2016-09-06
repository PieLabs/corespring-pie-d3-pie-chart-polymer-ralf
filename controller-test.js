var should = require('should');
var processing = require('./controller');

console.debug = function() {}

describe('processing', function() {

  describe('model', function() {

    describe('correctResponse', function() {

      function getModel(mode, answer) {
        var model = processing.model({
          correctResponse: ['correct'],
          feedback: {}
        }, {
          value: [answer]
        }, {
          locale: 'en_US',
          mode: mode
        });
        return model;
      }

      describe('in mode gather', function() {
        describe('when answer is correct', function() {
          should.not.exist(getModel('gather', 'correct').config.correctResponse)
        });
        describe('when answer is incorrect', function() {
          should.not.exist(getModel('gather', 'incorrect').config.correctResponse)
        });
      });
      describe('in mode view', function() {
        describe('when answer is correct', function() {
          should.not.exist(getModel('view', 'correct').config.correctResponse)
        });
        describe('when answer is incorrect', function() {
          should.not.exist(getModel('view', 'incorrect').config.correctResponse)
        });
      });
      describe('in mode evaluate', function() {
        describe('when answer is correct', function() {
          should.not.exist(getModel('evaluate', 'correct').config.correctResponse)
        });
        describe('when answer is incorrect', function() {
          should.exist(getModel('evaluate', 'incorrect').config.correctResponse)
        });
      });
    });

    describe('disabled', function() {
      it("is disabled, when mode is evaluate", function() {
        model = processing.model({}, {}, {
          locale: 'en_US',
          mode: 'evaluate'
        });
        model.config.disabled.should.eql(true);
      });
      it("is disabled, when mode is view", function() {
        model = processing.model({}, {}, {
          locale: 'en_US',
          mode: 'view'
        });
        model.config.disabled.should.eql(true);
      });
      it("is not disabled, when mode is gather", function() {
        model = processing.model({}, {}, {
          locale: 'en_US',
          mode: 'gather'
        });
        model.config.disabled.should.eql(false);
      });
    });

    describe('locale', function() {

      var question = {
        translations: {
          en_US: {
            PROMPT: 'en_US Prompt',
            LABEL: 'en_US Label',
            FB_ONE: 'en_US feedback one',
            FB_TWO: 'en_US feedback two',
            FB_THREE: 'en_US feedback three',
          }
        },
        correctResponse: [3, 3, 3],
        feedback: {
          "1": '$FB_ONE',
          "2": '$FB_TWO',
          "3": '$FB_THREE',
        },
        model: {
          prompt: '$PROMPT',
          sections: [
            {
              label: '$LABEL',
              value: 1
            },
            {
              label: 'no lookup',
              value: 2
            },
            {
              label: '$NOT_FOUND_LABEL',
              value: 3
            }
          ]

        }
      }

      var session = {
        value: [1, 2, 3]
      };
      var model;

      beforeEach(function() {
        model = processing.model(question, session, {
          locale: 'en_US',
          mode: 'evaluate'
        });
      });

      it('looks up the locale for the prompt', function() {
        model.config.prompt.should.eql('en_US Prompt');
      });

      it('looks up the locale for a choice', function() {
        model.config.sections[0].label.should.eql('en_US Label');
      });

      it('skips the lookup if the choice does not start with a $', function() {
        model.config.sections[1].label.should.eql('no lookup');
      });

      it('returns the value if it starts with a $ but no translation is found', function() {
        model.config.sections[2].label.should.eql('$NOT_FOUND_LABEL');
      });

      it('sets the feedback', function() {
        model.outcomes[0].feedback.should.eql('en_US feedback one');
      });
    });
  })
});