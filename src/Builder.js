import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import swal from 'sweetalert';
require('./Builder.css');

class QuestionBuilder extends Component {
  state = {
    question: "",
    choices: [],
    currentChoice: "",
    choiceCount: 0
  }

  _onEditQuestion = e => {
    // TODO: debounce this
    this.setState({
      question: e.target.value
    })
  }

  _onEditChoice = e => {
    // TODO: debounce this
    this.setState({
      currentChoice: e.target.value
    })
  }

  _onChoiceEnter = e => {
    try {
      if (e.keyCode === 13 && e.shiftKey === false) {
        this.throwError(this.state.currentChoice.trim === '', "You must provide choice!")

        this.setState({
          choices: [...this.state.choices, {
            choice: this.state.currentChoice,
            index: this.state.choiceCount,
            isCorrect: false
          }],
          currentChoice: "",
          choiceCount: this.state.choiceCount + 1
        })
    
        e.target.value = ""
      }
      
    } catch (err) {
      console.error(err);
      swal("Oops!", "You must provide choice!", "error");
    }
  }

  _onAddChoice = e => {
    try {
      this.throwError(this.state.currentChoice.trim === '', "You must provide choice!")
  
      this.setState({
        choices: [...this.state.choices, {
          choice: this.state.currentChoice,
          index: this.state.choiceCount,
          isCorrect: false
        }],
        currentChoice: "",
        choiceCount: this.state.choiceCount + 1
      })
  
      e.target.value = ""
    } catch (err) {
      console.error(err);
      // swal("Oops!", "You must provide choice!", "error");
    }
  }

  _onSelectChoice = index => e => {
    this.setState({
      choices: this.state.choices.map(choice => {
        return {
          choice: choice.choice,
          index: choice.index,
          isCorrect: choice.index === index ? true : false
        }
      })
    })
  }

  _onDeleteChoice = index => e => {

    // Stops the parent box from emitting a click event.
    e.stopPropagation();

    const selectedChoices = this.state.choices.filter(choice => choice.index !== index)

    this.setState({
      choices: selectedChoices
    })
  }

  _onSubmitQuestion = async () => {
    try {
      this.throwError(!this.state.choices.some(choice => choice.isCorrect), "You must provide a correct answer!")
      this.throwError(this.state.question.trim === '', "You must provide a question!")

      const result = await this.props.addQuestion({
        variables: {
          question: this.state.question,
          answers: this.state.choices.map(choice => {
            return `${choice.isCorrect + 0}${choice.choice}`
          })
        }
      })
  
      swal("Awesome!", "The question has been recorded!", "success")
  
      this.setState({
        question: "",
        choices: [],
        currentChoice: "",
        choiceCount: 0
      })
  
      console.log(result)
    } catch(err) {
      console.error(err)
      swal("Oh no!", err.message, "error")
    }
  }

  throwError = (condition, message) => {
    if (condition) {
      swal("Oops!", message, "error");
      throw new Error(message);
    }
  }

  render() {
    return <div>
      <section className="hero is-info is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              ASCPI Question Builder
            </h1>
            <h2 className="subtitle">
              Add questions to the ASCPI Reviewer Web App!
            </h2>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="field">
            <label className="label is-size-2">Question</label>
            <div className="control">
              <input onChange={this._onEditQuestion} className="input is-large" type="text" value={this.state.question} placeholder="Example: 'What is your name?'" />
            </div>
          </div>
          <div className="field">
            <label className="label is-size-2">Choices</label>

            {
              this.state.choices.map((choice) => {
                return <div key={choice.index} className="box" onClick={this._onSelectChoice(choice.index)}>
                  <label className="radio">
                    <input
                      onChange={this._onSelectChoice(choice.index)}
                      type="radio"
                      checked={choice.isCorrect}
                      name="choice" /> {choice.choice}
                  </label>
                  
                  <button onClick={this._onDeleteChoice(choice.index)} className="delete" />
                </div>
              })
            }

            <div className="control">
              <input onChange={this._onEditChoice} onKeyDown={this._onChoiceEnter} className="input is-large" type="text" placeholder="Example: 'John Paul'" />
            </div>
          </div>
          <div className="field">
            <a onClick={this._onAddChoice} className="button is-info is-large">
              <span className="icon is-large">
                <i className="fa fa-plus"></i>
              </span>
              <span>Add Choice</span>
            </a>
          </div>
          <div className="field">
            <a onClick={this._onSubmitQuestion} className="button is-success is-large">
              <span className="icon is-large">
                <i className="fa fa-save"></i>
              </span>
              <span>Save Question</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  }
}

const AddQuestion = gql`
mutation AddQuestion($question: String!, $answers: [String!]!) {
  createQuestion(question: $question, answers: $answers) {
    id
  }
}
`;

const Builder = compose(
  graphql(AddQuestion, {name: "addQuestion"})
)(QuestionBuilder);

export default Builder;