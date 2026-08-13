function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('SPH Media - Project Portfolio')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------------------------------------------------------
// CACHE & LOGGING UTILITIES
// ---------------------------------------------------------

function clearDashboardCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('dashboardData');
}

function logAction(actionType, targetName, details) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ActionLog');
  if (!sheet) return; // Fail silently if sheet doesn't exist yet
  
  const userEmail = Session.getActiveUser().getEmail() || 'Unknown User';
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([timestamp, userEmail, actionType, targetName, details || '']);
}

function getLogs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ActionLog');
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  // Return logs sorted by newest first (ignoring header)
  return data.slice(1).map(row => ({
    timestamp: row[0],
    email: row[1],
    actionType: row[2],
    targetName: row[3],
    details: row[4]
  })).reverse();
}

// ---------------------------------------------------------
// MAIN DATA FETCH
// ---------------------------------------------------------

function getDashboardData() {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('dashboardData');
  const userEmail = Session.getActiveUser().getEmail();
  
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    parsedData.currentUser = userEmail; // Always inject the fresh user
    return parsedData;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Safely get or create sheets
  const getSheetData = (name) => {
    const sheet = ss.getSheetByName(name);
    return sheet ? sheet.getDataRange().getValues() : [];
  };

  const projectsData = getSheetData('Projects');
  const activitiesData = getSheetData('Activities');
  const raidData = getSheetData('RaidLog');
  const commentsData = getSheetData('Comments');
  const raidCommentsData = getSheetData('RaidComments');
  const tasksData = getSheetData('Tasks');

  let projectsList = [];
  let projectsMap = {};

  // 1. Parse Projects
  if (projectsData.length > 1) {
    projectsData.slice(1).forEach(row => {
      if (!row[0]) return;
      const proj = {
        id: String(row[0]),
        name: row[1] || 'Unnamed Project',
        sponsor: row[2] || '',
        manager: row[3] || '',
        techLead: row[4] || '',
        teamMembers: row[5] || '',
        objective: row[6] || '',
        scope: row[7] || '',
        budget: row[8] || '$0',
        actualSpend: row[9] || '$0',
        overallStatus: row[10] || 'Not Started',
        department: row[11] || 'Infra & Ops',
        projectType: row[12] || '',
        activities: [],
        raidItems: [],
        tasks: []
      };
      projectsMap[proj.id] = proj;
      projectsList.push(proj);
    });
  }

  // 2. Parse Activities
  let activitiesMap = {};
  if (activitiesData.length > 1) {
    activitiesData.slice(1).forEach(row => {
      if (!row[0]) return;
      const act = {
        id: String(row[0]),
        projectId: String(row[1]),
        name: row[2],
        startYear: Number(row[3]) || 2024,
        startMonth: Number(row[4]) || 0,
        duration: Number(row[5]) || 1,
        status: row[6] || 'Not Started',
        isMilestone: row[7] === true || row[7] === 'TRUE' || row[7] === true,
        category: row[8] || 'Execution',
        level: Number(row[9]) || 0,
        comments: []
      };
      if (projectsMap[act.projectId]) {
        projectsMap[act.projectId].activities.push(act);
        activitiesMap[act.id] = act; // Track for comment mapping
      }
    });
  }
  
  // 3. Parse Activity Comments
  if (commentsData.length > 1) {
    commentsData.slice(1).forEach(row => {
      if (!row[0]) return;
      const comment = {
        id: String(row[0]),
        activityId: String(row[1]),
        timestamp: row[2],
        userEmail: row[3],
        commentText: row[4]
      };
      if (activitiesMap[comment.activityId]) {
        activitiesMap[comment.activityId].comments.push(comment);
      }
    });
  }

  // 4. Parse RAID Log
  let raidMap = {};
  if (raidData.length > 1) {
    raidData.slice(1).forEach(row => {
      if (!row[0]) return;
      const raidItem = {
        id: String(row[0]),
        projectId: String(row[1]),
        type: row[2] || 'Risk',
        description: row[3] || '',
        owner: row[4] || '',
        status: row[5] || 'Open',
        startDate: row[6] ? new Date(row[6]).toISOString() : '',
        endDate: row[7] ? new Date(row[7]).toISOString() : '',
        comments: []
      };
      if (projectsMap[raidItem.projectId]) {
        projectsMap[raidItem.projectId].raidItems.push(raidItem);
        raidMap[raidItem.id] = raidItem;
      }
    });
  }

  // 5. Parse RAID Comments
  if (raidCommentsData.length > 1) {
    raidCommentsData.slice(1).forEach(row => {
      if (!row[0]) return;
      const comment = {
        id: String(row[0]),
        raidId: String(row[1]),
        timestamp: row[2],
        userEmail: row[3],
        commentText: row[4]
      };
      if (raidMap[comment.raidId]) {
        raidMap[comment.raidId].comments.push(comment);
      }
    });
  }

  // 6. Parse Tasks (Action Items)
  if (tasksData.length > 1) {
    tasksData.slice(1).forEach(row => {
      if (!row[0]) return;
      const task = {
        id: String(row[0]),
        projectId: String(row[1]),
        date: row[2] ? new Date(row[2]).toISOString() : '',
        name: row[3] || '',
        details: row[4] || '',
        status: row[5] || 'Pending'
      };
      if (projectsMap[task.projectId]) {
        projectsMap[task.projectId].tasks.push(task);
      }
    });
  }

  const result = { projects: projectsList };
  
  // Save to cache for 15 minutes (900 seconds)
  cache.put('dashboardData', JSON.stringify(result), 900);
  
  // Add user context for the frontend
  result.currentUser = userEmail;
  return result;
}

// ---------------------------------------------------------
// PROJECT CRUD
// ---------------------------------------------------------

function upsertProject(proj) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Projects');
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(proj.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = [
    proj.id,
    proj.name || 'New Project',
    proj.sponsor || '',
    proj.manager || '',
    proj.techLead || '',
    proj.teamMembers || '',
    proj.objective || '',
    proj.scope || '',
    proj.budget || '$0',
    proj.actualSpend || '$0',
    proj.overallStatus || 'Not Started',
    proj.department || 'Infra & Ops',
    proj.projectType || ''
  ];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    logAction('UPDATE', proj.name, 'Updated project details.');
  } else {
    sheet.appendRow(rowData);
    logAction('CREATE', proj.name, 'Created new project.');
  }
  
  clearDashboardCache();
}

function deleteProject(projectId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Projects');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(projectId)) {
      const projName = data[i][1];
      sheet.deleteRow(i + 1);
      logAction('DELETE', projName, 'Deleted project and associated data.');
      clearDashboardCache();
      return;
    }
  }
}

// ---------------------------------------------------------
// ACTIVITY CRUD
// ---------------------------------------------------------

function upsertActivity(act) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Activities');
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(act.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = [
    act.id,
    act.projectId,
    act.name,
    act.startYear,
    act.startMonth,
    act.duration,
    act.status,
    act.isMilestone,
    act.category,
    act.level
  ];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    logAction('UPDATE', act.name, 'Updated activity details.');
  } else {
    sheet.appendRow(rowData);
    logAction('CREATE', act.name, 'Added new activity to project.');
  }
  
  clearDashboardCache();
}

function deleteActivity(activityId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Activities');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(activityId)) {
      const actName = data[i][2];
      sheet.deleteRow(i + 1);
      logAction('DELETE', actName, 'Deleted activity.');
      clearDashboardCache();
      return;
    }
  }
}

// ---------------------------------------------------------
// RAID LOG CRUD
// ---------------------------------------------------------

function upsertRaidItem(raid) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RaidLog');
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(raid.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  // Ensure dates are parsed properly for Sheets if they exist
  const startDateVal = raid.startDate ? new Date(raid.startDate) : '';
  const endDateVal = raid.endDate ? new Date(raid.endDate) : '';

  const rowData = [
    raid.id,
    raid.projectId,
    raid.type,
    raid.description,
    raid.owner,
    raid.status,
    startDateVal,
    endDateVal
  ];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    logAction('UPDATE', `RAID Item (${raid.type})`, `Updated status to ${raid.status}.`);
  } else {
    sheet.appendRow(rowData);
    logAction('CREATE', `RAID Item (${raid.type})`, 'Added new item to RAID log.');
  }
  
  clearDashboardCache();
}

function deleteRaidItem(raidId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RaidLog');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(raidId)) {
      const itemType = data[i][2];
      sheet.deleteRow(i + 1);
      logAction('DELETE', `RAID Item (${itemType})`, 'Removed item from RAID log.');
      clearDashboardCache();
      return;
    }
  }
}

// ---------------------------------------------------------
// TASK (ACTION ITEM) CRUD
// ---------------------------------------------------------

function upsertTask(task) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(task.id)) {
      rowIndex = i + 1;
      break;
    }
  }

  const dateVal = task.date ? new Date(task.date) : '';

  const rowData = [
    task.id,
    task.projectId,
    dateVal,
    task.name,
    task.details,
    task.status
  ];

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    logAction('UPDATE', `Task: ${task.name}`, `Updated action item.`);
  } else {
    sheet.appendRow(rowData);
    logAction('CREATE', `Task: ${task.name}`, 'Added new action item.');
  }
  
  clearDashboardCache();
}

function deleteTask(taskId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(taskId)) {
      const taskName = data[i][3];
      sheet.deleteRow(i + 1);
      logAction('DELETE', `Task: ${taskName}`, 'Removed action item.');
      clearDashboardCache();
      return;
    }
  }
}

// ---------------------------------------------------------
// COMMENTS (ACTIVITIES & RAID)
// ---------------------------------------------------------

function addComment(activityId, commentText) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Comments');
  const userEmail = Session.getActiveUser().getEmail() || 'Unknown User';
  const timestamp = new Date().toISOString();
  const id = `c${Date.now()}`;
  
  sheet.appendRow([id, activityId, timestamp, userEmail, commentText]);
  logAction('COMMENT', 'Activity', 'User added a discussion comment.');
  clearDashboardCache();
  
  return { id, activityId, timestamp, userEmail, commentText };
}

function addRaidComment(raidId, commentText) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RaidComments');
  
  // Auto-create the sheet if it doesn't exist yet
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('RaidComments');
    sheet.appendRow(['ID', 'RaidID', 'Timestamp', 'UserEmail', 'CommentText']);
  }

  const userEmail = Session.getActiveUser().getEmail() || 'Unknown User';
  const timestamp = new Date().toISOString();
  const id = `rc${Date.now()}`;
  
  sheet.appendRow([id, raidId, timestamp, userEmail, commentText]);
  logAction('COMMENT', 'RAID Item', 'User added a discussion comment to a RAID item.');
  clearDashboardCache();
  
  return { id, raidId, timestamp, userEmail, commentText };
}
