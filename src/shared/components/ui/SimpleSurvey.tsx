// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 *  █████╗ ██████╗  █████╗ ███████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ███████║██████╔╝███████║███████╗
 * ██╔══██║██╔══██╗██╔══██║╚════██║
 * ██║  ██║██║  ██║██║  ██║███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 *
 * Copyright (C) 2025 Rıza Emre ARAS <r.emrearas@proton.me>
 *
 * This file is part of ARTEK Homepage.
 *
 * ARTEK Homepage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// React
import React, { useState } from 'react';

// External libraries
import {
  Grid,
  Column,
  RadioButton,
  RadioButtonGroup,
  Button,
  InlineNotification,
} from '@carbon/react';

// Internal modules
import { useLocale } from '@shared/hooks';
import { translate } from '@shared/translations';

// Local components
import MDXContent from '@shared/components/content/MDXContent';

// Styles
import './styles/SimpleSurvey.scss';

interface SimpleSurveyProps {
  id?: string;
  questions: string[];
  successContent: string | any;
  failureContent: string | any;
}

type SurveyStatus = 'in_progress' | 'success' | 'failed';

/**
 * SimpleSurvey Component
 *
 * @example
 * <SimpleSurvey
 *   id="eligibility-survey"
 *   questions={['Question 1?', 'Question 2?']}
 *   successContent={<MDXContent content="Congratulations!" />}
 *   failureContent={<MDXContent content="Not eligible." />}
 * />
 */
const SimpleSurvey: React.FC<SimpleSurveyProps> = ({
  id = 'survey',
  questions,
  successContent,
  failureContent,
}) => {
  const { locale } = useLocale();
  const t = translate(locale);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>('in_progress');

  const totalQuestions = questions.length;
  const currentAnswer = answers[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canGoNext = currentAnswer !== null && !isLastQuestion && surveyStatus === 'in_progress';
  const canComplete = currentAnswer !== null && isLastQuestion && surveyStatus === 'in_progress';
  const canGoBack = currentQuestionIndex > 0 && surveyStatus === 'in_progress';

  const handleAnswerChange = (selection: string | number | undefined) => {
    if (typeof selection !== 'string') return;

    const answerValue = selection === 'yes';
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerValue;
    setAnswers(newAnswers);

    if (!answerValue) {
      setSurveyStatus('failed');
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      if (surveyStatus !== 'in_progress') {
        setSurveyStatus('in_progress');
      }
    }
  };

  const handleComplete = () => {
    if (canComplete) {
      const allYes = answers.every((answer) => answer === true);
      if (allYes) {
        setSurveyStatus('success');
      } else {
        setSurveyStatus('failed');
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setSurveyStatus('in_progress');
  };

  const renderResult = () => {
    if (surveyStatus === 'success') {
      return (
        <>
          <InlineNotification
            kind="success"
            title={t.simpleSurvey.results.success.title}
            subtitle={t.simpleSurvey.results.success.subtitle}
            hideCloseButton
            lowContrast
          />
          <div className="survey-message-content">
            <MDXContent content={successContent} />
          </div>
        </>
      );
    }

    if (surveyStatus === 'failed') {
      return (
        <>
          <InlineNotification
            kind="error"
            title={t.simpleSurvey.results.failure.title}
            subtitle={t.simpleSurvey.results.failure.subtitle}
            hideCloseButton
            lowContrast
          />
          <div className="survey-message-content">
            <MDXContent content={failureContent} />
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="simple-survey">
      <Grid>
        <Column xlg={16} lg={16} md={8} sm={4}>
          {surveyStatus === 'in_progress' ? (
            <>
              <div className="survey-progress">
                <span className="progress-text">
                  {currentQuestionIndex + 1} / {totalQuestions}
                </span>
              </div>

              <div className="survey-question">
                <h3 className="question-text">{questions[currentQuestionIndex]}</h3>
              </div>

              <div className="survey-answers">
                <RadioButtonGroup
                  name={`${id}-question-${currentQuestionIndex}`}
                  valueSelected={
                    currentAnswer === true ? 'yes' : currentAnswer === false ? 'no' : ''
                  }
                  onChange={handleAnswerChange}
                  orientation="horizontal"
                >
                  <RadioButton
                    labelText={t.simpleSurvey.answers.yes}
                    value="yes"
                    id={`${id}-question-${currentQuestionIndex}-yes`}
                  />
                  <RadioButton
                    labelText={t.simpleSurvey.answers.no}
                    value="no"
                    id={`${id}-question-${currentQuestionIndex}-no`}
                  />
                </RadioButtonGroup>
              </div>

              <div className="survey-navigation">
                <Button
                  kind="secondary"
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className="nav-button"
                >
                  {t.simpleSurvey.navigation.back}
                </Button>

                {!isLastQuestion ? (
                  <Button
                    kind="primary"
                    onClick={handleNext}
                    disabled={!canGoNext}
                    className="nav-button"
                  >
                    {t.simpleSurvey.navigation.next}
                  </Button>
                ) : (
                  <Button
                    kind="primary"
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className="nav-button"
                  >
                    {t.simpleSurvey.navigation.complete}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="survey-result">
              {renderResult()}

              <div className="survey-restart">
                <Button
                  kind={surveyStatus === 'success' ? 'tertiary' : 'primary'}
                  onClick={handleRestart}
                  className="restart-button"
                >
                  {surveyStatus === 'success'
                    ? t.simpleSurvey.restart.success
                    : t.simpleSurvey.restart.failure}
                </Button>
              </div>
            </div>
          )}
        </Column>
      </Grid>
    </div>
  );
};

export default SimpleSurvey;
