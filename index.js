const repositoryDropdown = document.getElementById('repository');
const showIssuesButton = document.getElementById('showIssuesButton');
const getRepos = document.getElementById('getRepos');
const issueList = document.getElementById('issueList');
const warning = document.getElementById('warning');
const newIssueButton = document.getElementById('newIssueButton');
const newIssueModal = document.getElementById('newIssueModal');
const closeModal = document.getElementsByClassName('close')[0];
const issueTitle = document.getElementById('titlePost');
const issueBody = document.getElementById('bodyPost');
const newIssueForm = document.getElementById('newIssueForm');
const tokenSubmitted = document.getElementById('token');
const modalToken = document.getElementById('modaltoken');
const tokenForm = document.getElementById('tokenForm');
const containers = document.getElementsByClassName('container');


//function to show modal
function modalShow() {
  newIssueModal.style.display = 'block';
  containers[0].style.opacity = '0.2';
  containers[0].style.pointerEvents = 'none';
}

//function to hide modal
function hideModal() {
  newIssueModal.style.display = 'none';
  containers[0].style.opacity = '1';
  containers[0].style.pointerEvents = 'auto';
  modalToken.value = '';
  issueTitle.value = '';
  issueBody.value = '';
}

//function to show messages
function warningMessage(message) {
  warning.innerHTML = `<h1 style="color:red;">${message}</h1>`;
}

//function to fetch repositories name
async function fetchRepositoriesName(token) {
  try {
    const url =
      'https://api.github.com/users/vishalsharma1777/repos?sort=created&direction=desc';
    var data = await fetch(url, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    if (data.status != 200) {
      throw new Error(data.status);
    }
    console.log(data.status);
    var repositories = await data.json();
    var repositoriesName = repositories.map((repo) => repo.name);
    return repositoriesName;
  } catch (err) {
    throw err;
  }
}

//function to show repositories name
async function showRepositories(tokenInput) {
  try {
    var repositoriesName = await fetchRepositoriesName(tokenInput);
    await appendRepositoriesName(repositoriesName);
  } catch (err) {
    console.log(err);
    warningMessage('Please Enter A Valid Token !!!');
  }
}

//function to fetch issues
async function fetchIssues(repoName, token) {
  try {
    const url = `https://api.github.com/repos/vishalsharma1777/${repoName}/issues?sort=created&direction=asc`;
    var data = await fetch(url, {
      headers: {
        Authorization: `token ${token}`
      }
    });
    if (data.status != 200) {
      throw new Error(data.status);
    }
    var issues = await data.json();
    console.log(issues);
    return issues;
  } catch (err) {
    throw err;
  }
}

//function to append all issues
async function appendAllIssues(issues) {
  if (issues.length == 0) {
    issueList.innerHTML = '';
    warningMessage('NO ISSUES FOR THIS REPOSITORY !!!');
  }
  issues.forEach((issue, index) => {
    warningMessage('');
    appendSingleIssue(issue, index);
  });
}

//function to show issues
async function showIssues(repoName, tokenInput) {
  try {
    var issues = await fetchIssues(repoName, tokenInput);
    issueList.innerHTML = '';
    await appendAllIssues(issues);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

//function to show issues on button click
async function showIssuesButtonClick() {
  try {
    const repoName = repositoryDropdown.value;
    await showIssues(repoName, tokenInput);
  } catch (err) {
    warningMessage('Please Enter A Valid Token !!!');
  }
}


//function to create new issue
async function createNewIssue(repoName, token, newIssue) {
  try {
    const url = `https://api.github.com/repos/vishalsharma1777/${repoName}/issues`;
    var data = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`
      },
      body: JSON.stringify(newIssue)
    });
    if (data.status != 201) {
      throw new Error(data.status);
    }
    var issue = await data.json();

    return issue;
  } catch (err) {
    throw err;
  }
}

//function to submit new issue form
async function newIssueFormSubmit() {
  try {
    const repoName = repositoryDropdown.value;
    var newIssue = await newIssueBody();
    tokenInput = modalToken.value;
    await createNewIssue(repoName, tokenInput, newIssue);
    await resetNewIssueBody();
    await showIssues(repoName, tokenInput);
    warningMessage('Issue Created Successfully !!!');
  } catch (err) {
    warningMessage(err);
  } finally {
    hideModal();
    setTimeout(() => {
      warningMessage('');
    }, 3000);
  }
}

//function to enter edit mode
function enterEdit(issueBody, issueTitle, updateButton) {
  issueBody.contentEditable = true;
  issueTitle.contentEditable = true;
  issueBody.focus();
  issueTitle.focus();
  issueBody.style.backgroundColor = 'grey';
  issueTitle.style.backgroundColor = 'grey';
  updateButton.textContent = `Save`;
  updateButton.parentElement.style.backgroundColor = 'red';
}

//function to exit edit mode
function exitEdit(issueBody, issueTitle, updateButton) {
  issueBody.contentEditable = false;
  issueTitle.contentEditable = false;
  issueBody.style.backgroundColor = '';
  issueTitle.style.backgroundColor = '';
  updateButton.textContent = ' updated ';
  updateButton.parentElement.style.backgroundColor = '';
}

//function to patch issue
async function updateIssue(url, token, issue) {
  try {
    var data = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`
      },
      body: JSON.stringify(issue)
    });
    if (data.status != 200) {
      throw new Error(data.status);
    }
    var issue = await data.json();
    return data.status;
  } catch (err) {
    throw err;
  }
}

//function to update issue
let isEditMode = false;
function updateFinally(targetElement,update){
  const issueTitle = targetElement.querySelector('#title');
    const issueBody = targetElement.querySelector('#body');
    const updatedIssue = updateBody(issueBody, issueTitle);
    if (!isEditMode) {
      enterEdit(issueBody, issueTitle, update);
      isEditMode = true;
    } else {
      const toUpdateUrl = targetElement.querySelector('#url').textContent;
      tokenInput = tokenSubmitted.value;
      updateIssue(toUpdateUrl, tokenInput, updatedIssue)
        .then((response) => {
          console.log(response);
          if (tokenInput === '') {
            warningMessage('Please enter your token');
          } else if (response === 200) {
            warningMessage('Issue Updated Successfully !!!');
            exitEdit(issueBody, issueTitle, update);
            isEditMode = false;
            setTimeout(() => {
              warningMessage('');
              showIssuesButton.click();
            }, 3000);
          } else {
            warningMessage(response);
          }
        })
        .catch((error) => {
          warningMessage(error);
        });
    }
}


//function to close issue
function closeFinally(targetElement){
  const toUpdateUrl = targetElement.querySelector('#url').textContent;
  console.log(targetElement.parentElement);
  tokenInput = tokenSubmitted.value;
  updateIssue(toUpdateUrl, tokenInput, closeIssue())
    .then((response) => {
      console.log(response);
      if (tokenInput === '') {
        warningMessage('Please enter your token');
      } else if (response === 200) {
        warningMessage('Issue Closed Successfully !!!');
        targetElement.parentElement.remove();
        setTimeout(() => {
          warningMessage('');
        }, 3000);
      } else {
        warningMessage(response);
      }
    })
    .catch((error) => {
      warningMessage(error);
    });
}

// DOM MANIPIULATION FUNCTIONS


//function to append repositories name
async function appendRepositoriesName(repositoriesName) {
  try {
    repositoryDropdown.innerHTML = '';
    repositoriesName.forEach((repo) => {
      const option = document.createElement('option');
      option.value = repo;
      option.innerHTML = repo;
      repositoryDropdown.appendChild(option);
    });
  } catch (err) {
    throw err;
  }
}

//function to create new issue body
async function newIssueBody() {
  var issue = {
    title: issueTitle.value,
    body: issueBody.value
  };
  return issue;
}

//function to reset new issue body
async function resetNewIssueBody() {
  (issueTitle.value = ''), (issueBody.value = '');
}

//function to append single issue
async function appendSingleIssue(issue, index) {
  const listItem = document.createElement('li');
  warning.innerHTML = '';
  listItem.innerHTML = `
<div class="issues">
  <div class="tableData">
  <table id="issuesTable">
  <thead>
  <tr>
    <th>Issue Number</th>
    <td id="number">${index + 1}</td>
  </tr><tr>
    <th>Issue Title</th>
    <td id="title" contenteditable="false" data-index="${index}" class="issuesTitle">
      ${issue.title}
    </td>
  </tr><tr>
    <th>Issue Body</th>
    <td id="body">${issue.body}</td>
  </tr><tr>
    <th>Issue Created At</th>
    <td id="createdAt">${issue.created_at.toString()}</td>
  </tr><tr>
    <th>Issue Status</th>
    <td id="status">${issue.state}</td>
  </tr><tr>
    <th>Issue URL</th>
    <td id="htmlurl" url-index="${index}">
      <a href="${issue.html_url}" target="_blank">${issue.html_url}</a></td>
  </tr><tr>
    <th>Issue JSON</th>
    <td id="url" url-index="${index}">
      <a href="${issue.url}" target="_blank">${issue.url}</a></td>
  </tr>
  </thead>
  </table>
  </div>

  <div class="operations">
  <div>
    <button type="button" id="updateButton" class="buttons update-button" data-index="${index}">
    <iclass="fa-solid fa-pen-nib"></i> Update Issue</button>
  </div><div>
    <button type="button" id="deleteButton" class="buttons">
    <i class="fa-solid fa-trash"></i> Close Issue</button>
  </div></div>
</div>`;
  issueList.appendChild(listItem);
}

//function to close issue
function closeIssue(){
  var statusClose ={
    state: 'closed'
  }
  return statusClose;
}

//function to update issue body
function updateBody(issueBody, issueTitle) {
  var updatedIssue = {
    title: issueTitle.textContent,
    body: issueBody.textContent
  }
  return updatedIssue;
}

// EVENT LISTENERS

//event listener for update and close button
issueList.addEventListener('click', (e) => {
  const targetElementforUpdate =
  e.target.parentElement.parentElement.parentElement.parentElement;
  const targetElementforDelete=
  e.target.parentElement.parentElement.parentElement;
  if (e.target.parentElement.id === 'updateButton') {
    updateFinally(targetElementforUpdate,e.target);
  }
  else if(e.target.id === 'deleteButton'){
    closeFinally(targetElementforDelete);
  }
});

//event listener for REPOS form
getRepos.addEventListener('click', (e) => {
  e.preventDefault();
  tokenInput = tokenSubmitted.value;
  showRepositories(tokenInput);
  warningMessage('');
});

//event listener for NEW ISSUE form
newIssueForm.addEventListener('submit', (e) => {
  e.preventDefault();
  newIssueFormSubmit();
});

//event listener for SHOWING ISSUES.
showIssuesButton.addEventListener('click', showIssuesButtonClick);
newIssueButton.addEventListener('click', modalShow);
closeModal.addEventListener('click', hideModal);
