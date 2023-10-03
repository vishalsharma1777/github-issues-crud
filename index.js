const repositoryDropdown = document.getElementById('repository');
const showIssuesButton = document.getElementById('showIssuesButton');
const issueList = document.getElementById('issueList');
const warning = document.getElementById('warning');
const newIssueButton = document.getElementById('newIssueButton');
const newIssueModal = document.getElementById('newIssueModal');
const span = document.getElementsByClassName('close')[0];
const issueTitle = document.getElementById('titlePost');
const issueBody = document.getElementById('bodyPost');
const newIssueForm = document.getElementById('newIssueForm');
const token = document.getElementById('token');
const modalToken = document.getElementById('modaltoken');
const tokenForm = document.getElementById('tokenForm');
const containers = document.getElementsByClassName('container');


newIssueButton.onclick = function () {
  newIssueModal.style.display = 'block';
  containers[0].style.opacity = '0.2';
  containers[0].style.pointerEvents = 'none';
};

span.onclick = function () {
  newIssueModal.style.display = 'none';
  var containers = document.getElementsByClassName('container');
  containers[0].style.opacity = '1';
  containers[0].style.pointerEvents = 'auto';
  issueTitle.value = '';
  issueBody.value = '';
};

function createIssue(token) {
  const selectedRepository = repositoryDropdown.value;
  console.log(selectedRepository);
  var newIssueTitle = issueTitle.value;
  var newIssueBody = issueBody.value;
  const issue = {
    title: newIssueTitle,
    body: newIssueBody
  };
  console.log(issue);
  const url = `https://api.github.com/repos/vishalsharma1777/${selectedRepository}/issues`;
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`
    },
    body: JSON.stringify(issue)
  })
    .then((response) => {
      if(token === ''){
        throw new Error('Please enter your token')}
      else if (response.status === 201) {
        alert('Issue created successfully.');
        newIssueModal.style.display = 'none';
        issueTitle.value = '';
        issueBody.value = '';
        span.click();
        showIssuesButton.click();
      } else {
        console.log(response.status);
        throw new Error(`Failed to create issue: ${response.status}`);
      }
    })
    .catch((error) => {
      alert(error);
      span.click();
      
    });
}

newIssueForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let yourToken = modalToken.value;
  console.log(yourToken);
  createIssue(yourToken);
});

function fetchRepositories() {
  let repoList = `https://api.github.com/users/vishalsharma1777/repos?sort=created&direction=desc`;
  fetch(repoList)
    .then((response) => response.json())
    .then((data) => {
      repositoryDropdown.innerHTML = '';
      data.forEach((repo) => {
        const option = document.createElement('option');
        option.value = repo.name;
        option.textContent = repo.name;
        repositoryDropdown.appendChild(option);
      });
    })
    .catch((error) => console.error('Error fetching repositories:', error));
}

fetchRepositories();

function fetchIssues(repoName) {
  let issueList1 = `https://api.github.com/repos/vishalsharma1777/${repoName}/issues?sort=created&direction=asc`;
  warning.innerHTML = `<h1 style="color:red;">Loading...</h1>`;
  fetch(issueList1)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(issueList1);
      issueList.innerHTML = '';
      if (data.length == 0) {
        warning.innerHTML = `<h1 style="color:red;">NO ISSUES FOR THIS REPOSITORY !!!</h1>`;
      } else {
        data.forEach((issue, index) => {
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
                            </tr>
                            <tr>
                                <th>Issue Title</th>
                                <td id="title" contenteditable="false" data-index="${index} class="issuesTitle">${
            issue.title
          }</td>
                            </tr>
                            <tr>
                                <th>Issue Body</th>
                                <td id="body">${issue.body}</td>
                            </tr>
                            <tr>
                                <th>Issue Created At</th>
                                <td id="createdAt">${issue.created_at.slice(
                                  0,
                                  10
                                )}</td>
                            </tr>
                            <tr>
                                <th>Issue Status</th>
                                <td id="status">${issue.state}</td>
                            </tr>
                            <tr>
                                <th>Issue URL</th>
                                <td id="htmlurl" url-index="${index}"><a href="${
            issue.html_url
          }" target="_blank">${issue.html_url}</a></td>
                            </tr> 
                            <tr>
                                <th>Issue JSON</th>
                                <td id="url" url-index="${index}"><a href="${
            issue.url
          }" target="_blank">${issue.url}</a></td>
                            </tr>   
                        </thead>
                    </table>
                </div>

                <div class="operations">
                    <div>
                    <button type="button" id="updateButton" class="buttons update-button" data-index="${index}"><i class="fa-solid fa-pen-nib"></i> Update Issue</button>
                    </div>
                    <div>
                        <button type="button" id="deleteButton" class="buttons"><i class="fa-solid fa-trash"></i> Delete Issue</button>
                    </div>
                </div>
            </div>
            `;
          issueList.appendChild(listItem);
        });
      }
    })
    .catch((err) => console.log(err));
}

showIssuesButton.addEventListener('click', () => {
  const selectedRepository = repositoryDropdown.value;
  if (selectedRepository) {
    fetchIssues(selectedRepository);
  }
  console.log('hi');
});

issueList.addEventListener('click', (e) => {
  if (e.target.id === 'deleteButton') {
    const toDeleteUrl =
      e.target.parentElement.parentElement.parentElement.querySelector(
        '#url'
      ).textContent;
    const updateButton =
      e.target.parentElement.parentElement.parentElement.querySelector(
        '#updateButton'
      );
    const issue = {
      state: 'closed'
    };
    let yourToken = token.value;
    console.log(yourToken);
    fetch(toDeleteUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${yourToken}`
      },
      body: JSON.stringify(issue)
    })
      .then((response) => {
        if(yourToken === ''){
          throw new Error('Please enter your token')}
        else if (response.status === 200) {
          alert('Deleting started');
          setTimeout(() => {
            alert('Issue deleted successfully.');
            console.log(e.target);
            e.target.disabled = true;
            updateButton.disabled = true;
            e.target.style.backgroundColor = 'grey';
            updateButton.style.backgroundColor = 'grey';
            e.target.textContent = 'Deleted';
            updateButton.textContent = 'Deleted';
          }, 2000);
        } else {
          console.log(response.status);
          throw new Error(`Failed to delete issue: ${response.status}`);
        }
      })
      .catch((error) => {
        alert(error);
      });
  }
});

let isEditMode = false;
issueList.addEventListener('click', (e) => {
  if (e.target.id === 'updateButton') {
    const issueTitle =
      e.target.parentElement.parentElement.parentElement.querySelector(
        '#title'
      );
    const issueBody =
      e.target.parentElement.parentElement.parentElement.querySelector('#body');

    if (!isEditMode) {
      issueTitle.contentEditable = true;
      issueBody.contentEditable = true;
      issueBody.focus();
      issueTitle.focus();
      issueBody.style.backgroundColor = 'grey';
      issueTitle.style.backgroundColor = 'grey';
      e.target.textContent = `Save`;
      e.target.style.backgroundColor = 'red';
      isEditMode = true;
    } else {
      const toUpdateUrl =
        e.target.parentElement.parentElement.parentElement.querySelector(
          '#url'
        ).textContent;
      let yourToken = token.value;
      console.log(yourToken);
      fetch(toUpdateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${yourToken}`
        },
        body: JSON.stringify({
          title: issueTitle.textContent,
          body: issueBody.textContent
        })
      })
        .then((response) => {
          if(yourToken === ''){
            throw new Error('Please enter your token')}
          else if (response.status === 200) {
            alert('Issue updated successfully.');
            isEditMode = false;
            showIssuesButton.click();
          } else {
            throw new Error(`Failed to update issue: ${response.status}`);
          }
        })
        .catch((error) => {
          alert(error);
        });
    }
  }
});
