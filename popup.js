document.addEventListener('DOMContentLoaded', function () {
  const tabTableBody = document.getElementById('tabTableBody');
  const pinnedUrlsButton = document.getElementById('pinnedUrlsButton');
  const pinnedUrlsContainer = document.getElementById('pinnedUrlsContainer');
  const pinnedUrlsList = document.getElementById('pinnedUrlsList');

  chrome.storage.local.get(['tabGroups', 'pinnedUrls'], function (result) {
    tabTableBody.innerHTML = '';
    let groups = result.tabGroups || {};
    let pinnedUrls = result.pinnedUrls || [];

    // Fetch all tab info to calculate open times
    chrome.storage.local.get(null, function (items) {
      for (let hostname in groups) {
        let groupTitleRow = document.createElement('tr');
        let faviconUrl = getFaviconUrl(`https://${hostname}`);
        groupTitleRow.innerHTML = `<th colspan="4"><img src="${faviconUrl}" style="width: 16px; height: 16px; margin-right: 5px;" />${hostname}</th>`;
        tabTableBody.appendChild(groupTitleRow);

        groups[hostname].forEach((tab) => {
          let tabInfo = items[tab.id.toString()];
          let openTimeText = tabInfo ? formatElapsedTime(Date.now() - tabInfo.openTime) : "N/A";

          let tabRow = document.createElement('tr');
          tabRow.innerHTML = `
            <td><img src="${getFaviconUrl(tab.url)}" style="width: 16px; height: 16px; margin-right: 5px;" />${hostname}</td>
            <td>${tab.title}</td>
            <td>${openTimeText}</td>
            <td>
              <span class="open-button button" data-tab-id="${tab.id}">Open</span>
              <span class="close-button button" data-tab-id="${tab.id}">Close</span>
              <span class="pin-button button" data-tab-url="${tab.url}">Pin</span>
            </td>`;

          // Add event listener to open button
          let openButton = tabRow.querySelector('.open-button');
          openButton.addEventListener('click', function () {
            let tabId = parseInt(this.getAttribute('data-tab-id'));
            chrome.tabs.update(tabId, { active: true });
            window.close(); // Close the popup after opening the tab
          });

          // Add event listener to close button
          let closeButton = tabRow.querySelector('.close-button');
          closeButton.addEventListener('click', function () {
            let tabId = parseInt(this.getAttribute('data-tab-id'));
            chrome.tabs.remove(tabId);
            // Remove the row from the table after closing the tab
            tabRow.remove();
          });

          // Add event listener to pin button
          let pinButton = tabRow.querySelector('.pin-button');
          pinButton.addEventListener('click', function () {
            let tabUrl = this.getAttribute('data-tab-url');
            if (!pinnedUrls.includes(tabUrl)) {
              pinnedUrls.push(tabUrl);
              chrome.storage.local.set({ pinnedUrls });
            }
          });

          tabTableBody.appendChild(tabRow);
        });
      }
    });
  });

  // Add event listener to pinned URLs button
  pinnedUrlsButton.addEventListener('click', function () {
    pinnedUrlsContainer.style.display = pinnedUrlsContainer.style.display === 'none' ? 'block' : 'none';
    pinnedUrlsList.innerHTML = '';

    chrome.storage.local.get(['pinnedUrls'], function (result) {
      let pinnedUrls = result.pinnedUrls || [];

      pinnedUrls.forEach((url) => {
        let faviconUrl = getFaviconUrl(url);
        let listItem = document.createElement('tr');
        listItem.innerHTML = `
          <td><img src="${faviconUrl}" style="width: 16px; height: 16px; margin-right: 5px;" />${extractDomain(url)}</td>
          <td><a href="${url}" target="_blank" class="pinned-url">${url}</a></td>
          <td><button class="delete-button button" data-url="${url}">Delete</button></td>
        `;
        listItem.querySelector('.delete-button').addEventListener('click', function () {
          let urlToDelete = this.getAttribute('data-url');
          pinnedUrls = pinnedUrls.filter(pinnedUrl => pinnedUrl !== urlToDelete);
          chrome.storage.local.set({ pinnedUrls }, function () {
            listItem.remove(); // Remove the list item from the UI
          });
        });
        pinnedUrlsList.appendChild(listItem);
      });
    });
  });
});

// Function to format elapsed time in days, hours, and minutes
function formatElapsedTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  hours = hours % 24;
  minutes = minutes % 60;
  seconds = seconds % 60;

  return `${days}d ${hours}h ${minutes}m`;
}

// Function to get favicon URL for a given URL
function getFaviconUrl(url) {
  // Extract domain from URL
  let domain = extractDomain(url);
  // Return favicon URL
  return `https://www.google.com/s2/favicons?domain=${domain}`;
}


// Function to extract domain from URL
function extractDomain(url) {
  let domain;
  // Find & remove protocol (http, https, ftp) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  // Find & remove port number
  domain = domain.split(':')[0];
  return domain;
}



// document.addEventListener('DOMContentLoaded', function () {
//   const tabTableBody = document.getElementById('tabTableBody');
//   const pinnedUrlsButton = document.getElementById('pinnedUrlsButton');
//   const pinnedUrlsContainer = document.getElementById('pinnedUrlsContainer');
//   const pinnedUrlsList = document.getElementById('pinnedUrlsList');

//   chrome.storage.local.get(['tabGroups', 'pinnedUrls'], function (result) {
//     tabTableBody.innerHTML = '';
//     let groups = result.tabGroups || {};
//     let pinnedUrls = result.pinnedUrls || [];

//     for (let hostname in groups) {
//       let groupTitleRow = document.createElement('tr');
//       let faviconUrl = getFaviconUrl(`https://${hostname}`);
//       groupTitleRow.innerHTML = `<th colspan="3"><img src="${faviconUrl}" style="width: 16px; height: 16px; margin-right: 5px;" />${hostname}</th>`;
//       tabTableBody.appendChild(groupTitleRow);

//       groups[hostname].forEach((tab) => {
//         let tabRow = document.createElement('tr');
//         tabRow.innerHTML = `
//           <td><img src="${getFaviconUrl(tab.url)}" style="width: 16px; height: 16px; margin-right: 5px;" />${hostname}</td>
//           <td>${tab.title}</td>
//           <td>
//             <span class="open-button button" data-tab-id="${tab.id}">Open</span>
//             <span class="close-button button" data-tab-id="${tab.id}">Close</span>
//             <span class="pin-button button" data-tab-url="${tab.url}">Pin</span>
//           </td>`;

//         // Add event listener to open button
//         let openButton = tabRow.querySelector('.open-button');
//         openButton.addEventListener('click', function () {
//           let tabId = parseInt(this.getAttribute('data-tab-id'));
//           chrome.tabs.update(tabId, { active: true });
//           window.close(); // Close the popup after opening the tab
//         });

//         // Add event listener to close button
//         let closeButton = tabRow.querySelector('.close-button');
//         closeButton.addEventListener('click', function () {
//           let tabId = parseInt(this.getAttribute('data-tab-id'));
//           chrome.tabs.remove(tabId);
//           // Remove the row from the table after closing the tab
//           tabRow.remove();
//         });

//         // Add event listener to pin button
//         let pinButton = tabRow.querySelector('.pin-button');
//         pinButton.addEventListener('click', function () {
//           let tabUrl = this.getAttribute('data-tab-url');
//           if (!pinnedUrls.includes(tabUrl)) {
//             pinnedUrls.push(tabUrl);
//             chrome.storage.local.set({ pinnedUrls });
//           }
//         });

//         tabTableBody.appendChild(tabRow);
//       });
//     }
//   });

//   // Add event listener to pinned URLs button
//   pinnedUrlsButton.addEventListener('click', function () {
//     pinnedUrlsContainer.style.display = pinnedUrlsContainer.style.display === 'none' ? 'block' : 'none';
//     pinnedUrlsList.innerHTML = '';

//     chrome.storage.local.get(['pinnedUrls'], function (result) {
//       let pinnedUrls = result.pinnedUrls || [];

//       pinnedUrls.forEach((url) => {
//         let faviconUrl = getFaviconUrl(url);
//         let listItem = document.createElement('tr');
//         listItem.innerHTML = `
//           <td style="width:100px;"><img src="${faviconUrl}" style="width: 16px; height: 16px; margin-right: 5px;" /> ${extractDomain(url)}</td>
//           <td><a href="${url}" target="_blank" class="pinned-url">${url}</a></td>
//           <td><button class="delete-button button" data-url="${url}">Delete</button></td>
//         `;
//         listItem.querySelector('.delete-button').addEventListener('click', function () {
//           let urlToDelete = this.getAttribute('data-url');
//           pinnedUrls = pinnedUrls.filter(pinnedUrl => pinnedUrl !== urlToDelete);
//           chrome.storage.local.set({ pinnedUrls }, function () {
//             listItem.remove(); // Remove the list item from the UI
//           });
//         });
//         pinnedUrlsList.appendChild(listItem);
//       });
//     });
//   });
// });

// // Function to get favicon URL for a given URL
// function getFaviconUrl(url) {
//   // Extract domain from URL
//   let domain = extractDomain(url);
//   // Return favicon URL
//   return `https://www.google.com/s2/favicons?domain=${domain}`;
// }

// // Function to extract domain from URL
// function extractDomain(url) {
//   let domain;
//   // Find & remove protocol (http, https, ftp) and get domain
//   if (url.indexOf("://") > -1) {
//     domain = url.split('/')[2];
//   } else {
//     domain = url.split('/')[0];
//   }
//   // Find & remove port number
//   domain = domain.split(':')[0];
//   return domain;
// }

