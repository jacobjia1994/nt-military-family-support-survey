const main=document.querySelector('#main');
const data=window.RAND_ADULT_DATA;
if(!main||!data||!window.SURVEY_RAND_ADULT_APP)throw new Error('The adult questionnaire could not load.');
window.SURVEY_RAND_ADULT_APP.create({main,data}).start();
