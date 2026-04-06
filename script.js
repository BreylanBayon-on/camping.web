
// ============================================
// GLOBAL STATE & SESSION MANAGEMENT
// ============================================
let currentUser = null;
let currentRole = null;
let allUsers = {}; // Store all users data
let qaQuestions = []; // Store custom Q&A questions
let campAdventures = []; // Store camp adventure types and descriptions
let currentAdventureIndex = 0; // For adventure carousel

// User database (in localStorage for persistence)
const DEMO_USERS = {
    'user': 'pass',
    'admin': 'admin'
};

// ============================================
// LOGIN SYSTEM
// ============================================

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.querySelector('input[name="loginRole"]:checked').value;

    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    // Check demo credentials
    if (DEMO_USERS[username] && DEMO_USERS[username] === password) {
        // Determine role from selection
        currentUser = username;
        currentRole = role;
        
        // Initialize user data if not exists
        if (!allUsers[username]) {
            allUsers[username] = {
                username: username,
                role: role,
                journalEntries: [],
                achievements: [],
                quizScore: 0,
                joinDate: new Date().toLocaleString(),
                lastActive: new Date().toLocaleString(),
                lastLogin: new Date().toLocaleString()
            };
        } else {
            // Update last login timestamp
            allUsers[username].lastLogin = new Date().toLocaleString();
            allUsers[username].lastActive = new Date().toLocaleString();
        }
        
        loadAppSession();
        showMainApp();
        return;
    }

    alert('Invalid credentials. Demo: user/pass (user) or admin/admin (admin)');
}

function registerNewUser() {
    const username = prompt('Enter new username:');
    if (!username) return;
    
    if (DEMO_USERS[username]) {
        alert('Username already exists');
        return;
    }
    
    const password = prompt('Enter password:');
    if (!password) return;
    
    // Add to demo users
    DEMO_USERS[username] = password;
    
    // Create user profile
    allUsers[username] = {
        username: username,
        role: 'user',
        journalEntries: [],
        achievements: [],
        quizScore: 0,
        joinDate: new Date().toLocaleString(),
        lastActive: new Date().toLocaleString(),
        lastLogin: new Date().toLocaleString()
    };
    
    saveAllUsersData();
    alert('Registration successful! You can now login.');
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function registerUser() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.querySelector('input[name="registerRole"]:checked').value;

    if (!username || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (DEMO_USERS[username]) {
        alert('Username already exists');
        return;
    }

    // Add to demo users
    DEMO_USERS[username] = password;
    
    // Create user profile
    allUsers[username] = {
        username: username,
        role: role,
        journalEntries: [],
        achievements: [],
        quizScore: 0,
        joinDate: new Date().toLocaleString(),
        lastActive: new Date().toLocaleString(),
        lastLogin: new Date().toLocaleString()
    };
    
    saveAllUsersData();
    
    // Clear form
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
    
    alert('Registration successful! You can now login with your credentials.');
    showLoginForm();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        saveAppData();
        saveAllUsersData();
        currentUser = null;
        currentRole = null;
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('menuToggle').style.display = 'none';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('menuToggle').style.display = 'block';
    
    // Update user display
    const userDisplay = document.getElementById('userDisplay');
    userDisplay.textContent = `${currentRole === 'admin' ? '👨‍💼' : '👤'} ${currentUser} (${currentRole})`;
    
    // Show appropriate menu
    if (currentRole === 'admin') {
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('adminMenu').style.display = 'flex';
        loadAdminDashboard();
    } else {
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('adminMenu').style.display = 'none';
    }
    
    // Load data
    loadAppSession();
    updateHomeAdventures(); // Display camp adventures on home page
}

function loadAppSession() {
    if (currentRole === 'user') {
        loadUserData();
    } else {
        loadAllUsersData();
        refreshAdminViews();
    }
    updateHomeAdventures(); // Always update home adventures display
}

// ============================================
// DATA PERSISTENCE
// ============================================

function loadUserData() {
    if (!currentUser || !allUsers[currentUser]) return;
    
    const userData = allUsers[currentUser];
    journalEntries = userData.journalEntries || [];
    achievements = userData.achievements || [];
    quizScore = userData.quizScore || 0;
    userInfo = userData.userInfo || { name: currentUser, email: "", avatar: "", bio: "", level: "Explorer Level 1" };
    
    // Render current data
    updateProfileJournals();
    refreshAchievements();
    updateProfileAchievements();
    updateProfileStats();
    updateProfileScore();
    updateProfileDisplay();
}

function saveAppData() {
    if (!currentUser || !allUsers[currentUser]) return;
    
    allUsers[currentUser].journalEntries = journalEntries;
    allUsers[currentUser].achievements = achievements;
    allUsers[currentUser].quizScore = quizScore;
    allUsers[currentUser].userInfo = userInfo;
    allUsers[currentUser].lastActive = new Date().toLocaleString();
    
    // Save to localStorage
    localStorage.setItem('campingAllUsers', JSON.stringify(allUsers));
}

function saveAllUsersData() {
    localStorage.setItem('campingAllUsers', JSON.stringify(allUsers));
    localStorage.setItem('campingQAQuestions', JSON.stringify(qaQuestions));
    localStorage.setItem('campingAdventures', JSON.stringify(campAdventures));
}

function loadAllUsersData() {
    const saved = localStorage.getItem('campingAllUsers');
    if (saved) {
        allUsers = JSON.parse(saved);
    }
    
    const savedQA = localStorage.getItem('campingQAQuestions');
    if (savedQA) {
        qaQuestions = JSON.parse(savedQA);
    }
    
    const savedAdventures = localStorage.getItem('campingAdventures');
    if (savedAdventures) {
        campAdventures = JSON.parse(savedAdventures);
    }
}

// ============================================
// ADMIN DASHBOARD FUNCTIONS
// ============================================

function loadAdminDashboard() {
    updateAdminStats();
    updateActivityLog();
    loadRecentlyLoggedInUsers();
    loadQAList();
    loadCampAdventuresList();
    
    // Set up auto-refresh for dashboard every 3 seconds
    if (window.dashboardRefreshInterval) {
        clearInterval(window.dashboardRefreshInterval);
    }
    window.dashboardRefreshInterval = setInterval(() => {
        if (document.getElementById('adminDashboard').classList.contains('active')) {
            loadAllUsersData();
            updateAdminStats();
            updateActivityLog();
            loadRecentlyLoggedInUsers();
        }
    }, 3000);
}

function updateAdminStats() {
    const totalUsers = Object.keys(allUsers).length;
    let totalJournals = 0;
    let totalAchievements = 0;
    let totalQuizScores = 0;
    let usersWithScores = 0;

    Object.values(allUsers).forEach(user => {
        if (user.journalEntries) totalJournals += user.journalEntries.length;
        if (user.achievements) totalAchievements += user.achievements.length;
        if (user.quizScore) {
            totalQuizScores += user.quizScore;
            usersWithScores++;
        }
    });

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalJournals').textContent = totalJournals;
    document.getElementById('totalAchievements').textContent = totalAchievements;
    
    // Calculate average percentage based on total questions
    let avgScore = 0;
    if (usersWithScores > 0 && qaQuestions.length > 0) {
        avgScore = Math.round((totalQuizScores / (usersWithScores * qaQuestions.length)) * 100);
    }
    document.getElementById('avgQuizScore').textContent = avgScore + '%';
}

function updateActivityLog() {
    const log = document.getElementById('adminActivityLog');
    log.innerHTML = '';
    
    const activities = [];
    
    // Add recent login activity
    Object.values(allUsers).forEach(user => {
        if (user.lastLogin) {
            activities.push({
                user: user.username,
                activity: '🔓 Logged In',
                date: user.lastLogin,
                role: user.role,
                priority: 3
            });
        }
    });
    
    // Add journal entries
    Object.values(allUsers).forEach(user => {
        if (user.journalEntries) {
            user.journalEntries.slice(-2).forEach(entry => {
                activities.push({
                    user: user.username,
                    activity: '📝 Added Journal Entry',
                    date: entry.dateTime,
                    role: user.role,
                    priority: 2
                });
            });
        }
    });
    
    // Add achievements
    Object.values(allUsers).forEach(user => {
        if (user.achievements) {
            user.achievements.slice(-2).forEach(entry => {
                activities.push({
                    user: user.username,
                    activity: '🏆 Added Achievement',
                    date: entry.dateTime,
                    role: user.role,
                    priority: 2
                });
            });
        }
    });
    
    // Sort by date and show latest 15
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        log.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No activities yet</p>';
        return;
    }
    
    activities.slice(0, 15).forEach(act => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.marginBottom = '8px';
        div.style.borderBottom = '1px solid #eee';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        
        const roleIcon = act.role === 'admin' ? '👨‍💼' : '👤';
        const roleClass = act.role === 'admin' ? '<span style="color: #dc3545; font-size: 11px; margin-left: 4px; font-weight: bold;">[ADMIN]</span>' : '';
        
        div.innerHTML = `
            <div style="flex: 1;">
                <strong>${roleIcon} ${act.user}${roleClass}</strong> ${act.activity}
                <br><small style="color: #999;">${act.date}</small>
            </div>
        `;
        log.appendChild(div);
    });
}

function loadRecentlyLoggedInUsers() {
    const container = document.getElementById('recentlyLoggedInUsers');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get all users sorted by last login time
    const usersList = Object.values(allUsers)
        .filter(user => user.lastLogin)
        .map(user => ({
            username: user.username,
            role: user.role,
            lastLogin: new Date(user.lastLogin),
            journalCount: (user.journalEntries || []).length,
            achievementCount: (user.achievements || []).length,
            quizScore: user.quizScore || 0
        }))
        .sort((a, b) => b.lastLogin - a.lastLogin);
    
    if (usersList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No users logged in yet</p>';
        return;
    }
    
    usersList.forEach((user, index) => {
        const div = document.createElement('div');
        div.style.padding = '12px';
        div.style.marginBottom = '10px';
        div.style.backgroundColor = '#f9f9f9';
        div.style.borderRadius = '8px';
        div.style.borderLeft = '4px solid #667eea';
        
        const roleIcon = user.role === 'admin' ? '👨‍💼' : '👤';
        const roleClass = user.role === 'admin' ? '<span style="color: #dc3545; font-weight: bold;"> [ADMIN]</span>' : '';
        
        const timeAgo = getTimeAgo(user.lastLogin);
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <p style="margin: 0 0 8px 0;"><strong>${roleIcon} ${user.username}${roleClass}</strong></p>
                    <p style="margin: 4px 0; font-size: 13px; color: #666;">📝 Journals: ${user.journalCount} | 🏆 Achievements: ${user.achievementCount} | ❓ Quiz: ${user.quizScore}</p>
                    <p style="margin: 4px 0; font-size: 12px; color: #999;">Last Login: <strong>${timeAgo}</strong></p>
                </div>
                <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">${index + 1}</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    
    return date.toLocaleString();
}

function refreshAdminViews() {
    updateAdminStats();
    updateActivityLog();
    loadAdminUsers();
    loadAdminSubmissions();
    loadQAList();
    loadCampAdventuresList();
}

// ============================================
// ADMIN Q&A MANAGEMENT
// ============================================

function addQAQuestion() {
    const question = document.getElementById('qaQuestion').value.trim();
    const type = document.getElementById('qaType').value;
    const options = document.getElementById('qaOptions').value.trim();
    const correctAnswer = document.getElementById('qaCorrectAnswer').value.trim();

    if (!question) {
        alert('Please enter a question');
        return;
    }

    const qaItem = {
        id: Date.now(),
        question: question,
        type: type,
        options: options,
        correctAnswer: correctAnswer,
        createdBy: currentUser,
        createdDate: new Date().toLocaleString()
    };

    qaQuestions.push(qaItem);
    saveAllUsersData();
    loadQAList();
    
    // Clear form
    document.getElementById('qaQuestion').value = '';
    document.getElementById('qaOptions').value = '';
    document.getElementById('qaCorrectAnswer').value = '';
    alert('Question added successfully!');
}

function editQAQuestion(id) {
    const qa = qaQuestions.find(q => q.id === id);
    if (!qa) return;

    const newQuestion = prompt('Edit question:', qa.question);
    if (newQuestion !== null) {
        qa.question = newQuestion;
        saveAllUsersData();
        loadQAList();
    }
}

function deleteQAQuestion(id) {
    if (confirm('Delete this question?')) {
        qaQuestions = qaQuestions.filter(q => q.id !== id);
        saveAllUsersData();
        loadQAList();
    }
}

function loadQAList() {
    const list = document.getElementById('qaList');
    if (!list) return;
    
    loadAllUsersData();
    
    list.innerHTML = '';
    if (qaQuestions.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">📋 No questions created yet</p>';
        return;
    }
    
    qaQuestions.forEach((qa, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        
        const userObj = Object.values(allUsers).find(u => u.username === qa.createdBy);
        const userRole = userObj?.role || 'unknown';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <p style="margin: 0; font-size: 14px; color: #999;"><strong>Q${index + 1}</strong></p>
                    <p style="margin: 8px 0 0 0;"><strong style="font-size: 15px;">${qa.question}</strong></p>
                </div>
                <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; white-space: nowrap;">${qa.type}</span>
            </div>
            <p style="margin: 8px 0; padding: 8px; background: #f0f0f0; border-radius: 6px; font-size: 13px;">
                👤 <strong>Created by: ${qa.createdBy}</strong> <span style="color: #999;">${userRole === 'admin' ? '[Admin]' : '[User]'}</span>
            </p>
            ${qa.options ? `<p style="margin: 8px 0; font-size: 13px; color: #555;"><strong>Options:</strong> ${qa.options}</p>` : ''}
            ${qa.correctAnswer ? `<p style="margin: 8px 0; font-size: 13px; color: #2e7d32;"><strong>✓ Answer:</strong> ${qa.correctAnswer}</p>` : ''}
            <p style="margin: 8px 0; font-size: 12px; color: #999;">📅 ${qa.createdDate}</p>
            <button onclick="editQAQuestion(${qa.id})">Edit</button>
            <button onclick="deleteQAQuestion(${qa.id})" class="delete-btn">Delete</button>
        `;
        list.appendChild(div);
    });
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

function loadAdminUsers() {
    const list = document.getElementById('usersList');
    if (!list) return;
    
    loadAllUsersData();
    
    list.innerHTML = '';
    
    const usersList = Object.values(allUsers).sort((a, b) => 
        new Date(b.lastActive) - new Date(a.lastActive)
    );
    
    if (usersList.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">👥 No users registered yet</p>';
        return;
    }
    
    usersList.forEach((user, index) => {
        const div = document.createElement('div');
        div.style.padding = '15px';
        div.style.borderBottom = '2px solid #eee';
        div.style.marginBottom = '10px';
        div.style.backgroundColor = '#f9f9f9';
        div.style.borderRadius = '8px';
        div.style.borderLeft = '4px solid ' + (user.role === 'admin' ? '#dc3545' : '#667eea');
        
        const journalCount = (user.journalEntries || []).length;
        const achievementCount = (user.achievements || []).length;
        const quizScore = user.quizScore || 0;
        const roleIcon = user.role === 'admin' ? '👨‍💼' : '👤';
        const roleDisplay = user.role === 'admin' ? '<span style="color: #dc3545; font-weight: bold; margin-left: 8px;">[ADMIN]</span>' : '';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="margin: 0; display: flex; align-items: center;">
                    ${roleIcon} <strong>${user.username}</strong>${roleDisplay}
                </h4>
                <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">#${index + 1}</span>
            </div>
            <p style="margin: 6px 0; font-size: 13px; color: #666;">
                <strong>Joined:</strong> ${user.joinDate}
            </p>
            <p style="margin: 6px 0; font-size: 13px; color: #666;">
                <strong>Last Active:</strong> ${user.lastActive}
            </p>
            <p style="margin: 10px 0; padding: 8px; background: white; border-radius: 6px; font-size: 13px;">
                📝 Journals: <strong>${journalCount}</strong> | 🏆 Achievements: <strong>${achievementCount}</strong> | ❓ Quiz: <strong>${quizScore}</strong>
            </p>
        `;
        list.appendChild(div);
    });
}

function loadAdminSubmissions() {
    loadAllUsersData(); // Always load latest data
    
    const journalsList = document.getElementById('adminJournalsList');
    const achievementsList = document.getElementById('adminAchievementsList');
    const quizList = document.getElementById('adminQuizList');
    
    if (journalsList) {
        journalsList.innerHTML = '';
        Object.entries(allUsers).forEach(([username, user]) => {
            if (user.journalEntries && user.journalEntries.length > 0) {
                user.journalEntries.forEach(entry => {
                    const div = document.createElement('div');
                    div.style.padding = '15px';
                    div.style.borderBottom = '2px solid #eee';
                    div.style.marginBottom = '15px';
                    div.style.backgroundColor = '#f9f9f9';
                    div.style.borderRadius = '8px';
                    
                    let content = `<div style="margin-bottom: 10px;"><strong style="font-size: 16px; color: #333;">👤 ${username}</strong> <small style="color: #999;">${entry.dateTime}</small></div>`;
                    
                    if (entry.photo) {
                        content += `<img src="${entry.photo}" alt="Journal Photo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                    }
                    
                    if (entry.text) {
                        content += `<p style="margin-top: 10px; color: #555; line-height: 1.6;">${entry.text}</p>`;
                    }
                    
                    div.innerHTML = content;
                    journalsList.appendChild(div);
                });
            }
        });
        if (journalsList.innerHTML === '') {
            journalsList.innerHTML = '<p style="color: #999; text-align: center; padding: 30px;">📝 No journals submitted yet</p>';
        }
    }
    
    if (achievementsList) {
        achievementsList.innerHTML = '';
        Object.entries(allUsers).forEach(([username, user]) => {
            if (user.achievements && user.achievements.length > 0) {
                user.achievements.forEach(entry => {
                    const div = document.createElement('div');
                    div.style.padding = '15px';
                    div.style.borderBottom = '2px solid #eee';
                    div.style.marginBottom = '15px';
                    div.style.backgroundColor = '#f9f9f9';
                    div.style.borderRadius = '8px';
                    
                    let content = `<div style="margin-bottom: 10px;"><strong style="font-size: 16px; color: #333;">👤 ${username}</strong> <small style="color: #999;">${entry.dateTime}</small></div>`;
                    
                    if (entry.photo) {
                        content += `<img src="${entry.photo}" alt="Achievement Photo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                    }
                    
                    if (entry.text) {
                        content += `<p style="margin-top: 10px; color: #555; line-height: 1.6;">${entry.text}</p>`;
                    }
                    
                    div.innerHTML = content;
                    achievementsList.appendChild(div);
                });
            }
        });
        if (achievementsList.innerHTML === '') {
            achievementsList.innerHTML = '<p style="color: #999; text-align: center; padding: 30px;">🏆 No achievements submitted yet</p>';
        }
    }
    
    if (quizList) {
        quizList.innerHTML = '';
        Object.entries(allUsers).forEach(([username, user]) => {
            if (user.quizScore && user.quizScore > 0) {
                const div = document.createElement('div');
                div.style.padding = '12px';
                div.style.borderBottom = '1px solid #eee';
                div.style.marginBottom = '10px';
                div.style.backgroundColor = '#f9f9f9';
                div.style.borderRadius = '6px';
                
                const totalQuestions = qaQuestions.length || 1;
                const percent = Math.round((user.quizScore / totalQuestions) * 100);
                
                let statusColor = '#2e7d32'; // Green
                if (percent < 50) statusColor = '#dc3545'; // Red
                else if (percent < 70) statusColor = '#ffc107'; // Yellow
                
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 16px; color: #333;">👤 ${username}</strong>
                        <span style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold;">
                            ${user.quizScore}/${totalQuestions} (${percent}%)
                        </span>
                    </div>
                `;
                quizList.appendChild(div);
            }
        });
        if (quizList.innerHTML === '') {
            quizList.innerHTML = '<p style="color: #999; text-align: center; padding: 30px;">❓ No quiz results yet</p>';
        }
    }
}

// ============================================
// ADMIN CAMP ADVENTURES MANAGEMENT
// ============================================

function addCampAdventure() {
    try {
        const type = document.getElementById('adventureType').value.trim();
        const description = document.getElementById('adventureDescription').value.trim();
        const photoInput = document.getElementById('adventurePhoto');
        const photo = photoInput ? photoInput.files[0] : null;

        if (!type || !description) {
            alert('Please enter both adventure type and description');
            return;
        }

        // Handle photo upload
        if (photo) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const adventure = {
                        id: Date.now(),
                        type: type,
                        description: description,
                        photo: e.target.result, // base64 encoded image
                        createdBy: currentUser,
                        createdDate: new Date().toLocaleString()
                    };

                    campAdventures.push(adventure);
                    saveAllUsersData();
                    loadCampAdventuresList();
                    updateHomeAdventures();
                    
                    // Clear form
                    document.getElementById('adventureType').value = '';
                    document.getElementById('adventureDescription').value = '';
                    if (photoInput) photoInput.value = '';
                    alert('Camp adventure added successfully!');
                } catch (error) {
                    console.error('Error in photo upload callback:', error);
                }
            };
            reader.onerror = function() {
                console.error('Error reading photo file');
                alert('Error reading photo file');
            };
            reader.readAsDataURL(photo);
        } else {
            const adventure = {
                id: Date.now(),
                type: type,
                description: description,
                photo: null,
                createdBy: currentUser,
                createdDate: new Date().toLocaleString()
            };

            campAdventures.push(adventure);
            saveAllUsersData();
            loadCampAdventuresList();
            updateHomeAdventures();
            
            // Clear form
            document.getElementById('adventureType').value = '';
            document.getElementById('adventureDescription').value = '';
            if (photoInput) photoInput.value = '';
            alert('Camp adventure added successfully!');
        }
    } catch (error) {
        console.error('Error adding camp adventure:', error);
        alert('Error adding camp adventure: ' + error.message);
    }
}

function editCampAdventure(id) {
    const adventure = campAdventures.find(a => a.id === id);
    if (!adventure) return;

    const newType = prompt('Edit adventure type:', adventure.type);
    if (newType === null) return;
    
    const newDescription = prompt('Edit adventure description:', adventure.description);
    if (newDescription === null) return;

    // Ask if user wants to change photo
    const changePhoto = confirm('Do you want to upload a new photo? (Current photo will be kept if you cancel)');
    if (changePhoto) {
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*';
        photoInput.onchange = function() {
            const file = photoInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    adventure.photo = e.target.result;
                    adventure.type = newType;
                    adventure.description = newDescription;
                    saveAllUsersData();
                    loadCampAdventuresList();
                    updateHomeAdventures();
                };
                reader.readAsDataURL(file);
            } else {
                adventure.type = newType;
                adventure.description = newDescription;
                saveAllUsersData();
                loadCampAdventuresList();
                updateHomeAdventures();
            }
        };
        photoInput.click();
    } else {
        adventure.type = newType;
        adventure.description = newDescription;
        saveAllUsersData();
        loadCampAdventuresList();
        updateHomeAdventures();
    }
}

function deleteCampAdventure(id) {
    if (confirm('Delete this camp adventure?')) {
        campAdventures = campAdventures.filter(a => a.id !== id);
        saveAllUsersData();
        loadCampAdventuresList();
        updateHomeAdventures();
    }
}

function loadCampAdventuresList() {
    const list = document.getElementById('adventuresList');
    if (!list) return;
    
    loadAllUsersData();
    
    list.innerHTML = '';
    if (campAdventures.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">🏕 No camp adventures created yet</p>';
        return;
    }
    
    campAdventures.forEach((adventure, index) => {
        const div = document.createElement('div');
        div.className = 'card';
        
        const userObj = Object.values(allUsers).find(u => u.username === adventure.createdBy);
        const userRole = userObj?.role || 'unknown';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <p style="margin: 0; font-size: 14px; color: #999;"><strong>Adventure ${index + 1}</strong></p>
                    <p style="margin: 8px 0 0 0;"><strong style="font-size: 16px; color: #2e7d32;">🏕 ${adventure.type}</strong></p>
                </div>
            </div>
            ${adventure.photo ? `<img src="${adventure.photo}" alt="${adventure.type}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">` : ''}
            <p style="margin: 8px 0; padding: 12px; background: #f0f0f0; border-radius: 6px; font-size: 14px; line-height: 1.5;">
                ${adventure.description}
            </p>
            <p style="margin: 8px 0; font-size: 12px; color: #999;">
                👤 <strong>Created by: ${adventure.createdBy}</strong> <span style="color: #999;">${userRole === 'admin' ? '[Admin]' : '[User]'}</span>
                <br>📅 ${adventure.createdDate}
            </p>
            <button onclick="editCampAdventure(${adventure.id})">Edit</button>
            <button onclick="deleteCampAdventure(${adventure.id})" class="delete-btn">Delete</button>
        `;
        list.appendChild(div);
    });
}

function updateHomeAdventures() {
    try {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        // Find the existing card in home section
        const existingCard = homeSection.querySelector('.card');
        if (!existingCard) return;
        
        // Create adventures display
        let adventuresHTML = '';
        if (campAdventures.length > 0) {
            adventuresHTML = `
                <div style="margin-top: 20px;">
                    <h4 style="color: #2e7d32; margin-bottom: 15px;">🏕 Available Camp Adventures</h4>
                    <div id="adventureCarousel" style="position: relative; overflow: hidden; border-radius: 8px; background: rgba(46, 125, 50, 0.05); min-height: 300px;">
                        <div id="adventureSlides" style="display: flex; transition: transform 0.3s ease;">
            `;
            
            campAdventures.forEach((adventure, index) => {
                const photoHTML = adventure.photo 
                    ? `<img src="${adventure.photo}" alt="${adventure.type}" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 15px; object-fit: cover;">`
                    : '<div style="width: 100%; height: 200px; background: rgba(46, 125, 50, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;"><span style="font-size: 48px;">🏕</span></div>';
                
                adventuresHTML += `
                    <div class="adventure-slide" style="min-width: 100%; padding: 20px; box-sizing: border-box;">
                        <div style="text-align: center;">
                            ${photoHTML}
                            <h5 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 18px;">🏕 ${adventure.type}</h5>
                            <p style="margin: 0; color: #555; line-height: 1.4; text-align: left;">${adventure.description}</p>
                        </div>
                    </div>
                `;
            });
            
            adventuresHTML += `
                        </div>
                        ${campAdventures.length > 1 ? `
                        <button id="prevAdventure" onclick="changeAdventure(-1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 18px;">‹</button>
                        <button id="nextAdventure" onclick="changeAdventure(1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 18px;">›</button>
                        <div id="adventureIndicators" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px;">
                            ${campAdventures.map((_, index) => `<div class="indicator" onclick="goToAdventure(${index})" style="width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer;"></div>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // Update the card content
        existingCard.innerHTML = `
            <p>Your all in one camp Companion!</p>
            ${adventuresHTML}
        `;
        
        // Initialize carousel
        if (campAdventures.length > 0) {
            currentAdventureIndex = 0;
            updateAdventureDisplay();
            updateAdventureIndicators();
        }
    } catch (error) {
        console.error('Error updating home adventures:', error);
    }
}

// Carousel navigation functions
function changeAdventure(direction) {
    try {
        if (campAdventures.length === 0) return;
        
        currentAdventureIndex += direction;
        if (currentAdventureIndex < 0) currentAdventureIndex = campAdventures.length - 1;
        if (currentAdventureIndex >= campAdventures.length) currentAdventureIndex = 0;
        
        updateAdventureDisplay();
        updateAdventureIndicators();
    } catch (error) {
        console.error('Error changing adventure:', error);
    }
}

function goToAdventure(index) {
    try {
        if (index < 0 || index >= campAdventures.length) return;
        
        currentAdventureIndex = index;
        updateAdventureDisplay();
        updateAdventureIndicators();
    } catch (error) {
        console.error('Error going to adventure:', error);
    }
}

function updateAdventureDisplay() {
    try {
        const slides = document.getElementById('adventureSlides');
        if (slides && campAdventures.length > 0) {
            slides.style.transform = `translateX(-${currentAdventureIndex * 100}%)`;
        }
    } catch (error) {
        console.error('Error updating adventure display:', error);
    }
}

function updateAdventureIndicators() {
    try {
        const indicators = document.querySelectorAll('#adventureIndicators .indicator');
        if (indicators.length === 0) return; // Indicators not yet created
        
        indicators.forEach((indicator, index) => {
            if (index === currentAdventureIndex) {
                indicator.style.background = 'rgba(255,255,255,0.9)';
            } else {
                indicator.style.background = 'rgba(255,255,255,0.5)';
            }
        });
    } catch (error) {
        console.error('Error updating adventure indicators:', error);
    }
}

// ============================================
// ORIGINAL USER FUNCTIONS (MODIFIED FOR MULTI-USER)
// ============================================

let journalEntries = [];
let achievements = [];
let userInfo = {
    name: "Camper",
    email: "",
    avatar: "",
    bio: "",
    level: "Explorer Level 1"
};
let quizScore = 0;

// NAVIGATION
function showSection(id, navElement) {
    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(nav => {
        nav.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    if (navElement) {
        navElement.classList.add("active");
    }

    // Hide sidebar after navigation
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (sidebar && sidebar.classList.contains('visible')) {
        sidebar.classList.remove('visible');
    }
    if (main) {
        main.classList.remove('with-sidebar');
    }
    
    // Render quiz when quiz section is shown
    if (id === 'qa' && currentRole === 'user') {
        renderQuiz();
    }
    
    // Load followed users when profile is shown
    if (id === 'profile') {
        loadUserInfoIntoForm();
    }
    
    // Initialize adventure carousel when home is shown
    if (id === 'home') {
        updateAdventureIndicators();
    }
    
    // Auto-refresh admin submissions
    if (id === 'adminSubmissions' && currentRole === 'admin') {
        loadAllUsersData();
        loadAdminSubmissions();
        
        // Set up auto-refresh every 2 seconds while viewing submissions
        if (window.submissionsRefreshInterval) {
            clearInterval(window.submissionsRefreshInterval);
        }
        window.submissionsRefreshInterval = setInterval(() => {
            if (document.getElementById('adminSubmissions').classList.contains('active')) {
                loadAllUsersData();
                loadAdminSubmissions();
            }
        }, 2000);
    } else {
        // Clear refresh interval when leaving submissions
        if (window.submissionsRefreshInterval) {
            clearInterval(window.submissionsRefreshInterval);
            window.submissionsRefreshInterval = null;
        }
    }
}

function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    if (!sidebar || !main) return;
    sidebar.classList.toggle('visible');
    if (window.innerWidth > 768) {
        main.classList.toggle('with-sidebar');
    }
}

// ============================================
// DYNAMIC QUIZ RENDERING
// ============================================

function renderQuiz() {
    loadAllUsersData();
    const container = document.getElementById('questionsContainer');
    const noQuestionsMsg = document.getElementById('noQuestionsMsg');
    const submitBtn = document.getElementById('submitQuizBtn');
    
    if (!qaQuestions || qaQuestions.length === 0) {
        container.innerHTML = '';
        noQuestionsMsg.style.display = 'block';
        submitBtn.style.display = 'none';
        return;
    }
    
    noQuestionsMsg.style.display = 'none';
    container.innerHTML = '';
    submitBtn.style.display = 'block';
    
    qaQuestions.forEach((qa, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `<p><strong>${index + 1}. ${qa.question}</strong></p>`;
        
        if (qa.type === 'multiple') {
            // Parse options: Format "A|B|C|D" with [answer] for correct
            const optionsText = qa.options;
            if (optionsText) {
                const options = optionsText.split('|').map(opt => opt.trim());
                options.forEach((opt, i) => {
                    const letter = String.fromCharCode(97 + i); // a, b, c, d...
                    questionDiv.innerHTML += `<label><input type="radio" name="qa_${qa.id}" value="${letter}"> ${opt}</label><br>`;
                });
            }
        } else if (qa.type === 'text') {
            questionDiv.innerHTML += `<input type="text" name="qa_${qa.id}" placeholder="Your answer" style="width: 100%; margin-top: 10px;">`;
        } else if (qa.type === 'essay') {
            questionDiv.innerHTML += `<textarea name="qa_${qa.id}" placeholder="Your answer" style="width: 100%; margin-top: 10px; height: 100px;"></textarea>`;
        }
        
        container.appendChild(questionDiv);
    });
}

function submitQuiz() {
    loadAllUsersData();
    
    if (!qaQuestions || qaQuestions.length === 0) {
        alert('No questions available');
        return;
    }
    
    let score = 0;
    let totalQuestions = qaQuestions.length;
    let results = [];
    
    qaQuestions.forEach((qa) => {
        const fieldName = `qa_${qa.id}`;
        let userAnswer = '';
        
        if (qa.type === 'multiple') {
            const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
            userAnswer = selected ? selected.value : '';
        } else {
            const input = document.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`);
            userAnswer = input ? input.value.toLowerCase().trim() : '';
        }
        
        // Check answer
        let isCorrect = false;
        if (qa.type === 'multiple') {
            // Extract correct answer from correctAnswer field
            isCorrect = userAnswer === qa.correctAnswer?.toLowerCase();
        } else {
            // For text/essay, check if answer contains key words from correctAnswer
            const keywords = qa.correctAnswer?.toLowerCase().split(',').map(k => k.trim()) || [];
            const matches = keywords.filter(keyword => userAnswer.includes(keyword)).length;
            isCorrect = matches >= Math.max(1, Math.ceil(keywords.length / 2));
        }
        
        if (isCorrect) score++;
        
        results.push({
            question: qa.question,
            userAnswer: userAnswer || '(No answer)',
            isCorrect: isCorrect,
            correctAnswer: qa.correctAnswer || 'N/A'
        });
    });
    
    const percentage = Math.round((score / totalQuestions) * 100);
    quizScore = score;
    
    saveAppData();
    updateAdminStats();
    
    // Trigger admin submissions and dashboard refresh
    if (document.getElementById('adminSubmissions')?.classList.contains('active')) {
        loadAllUsersData();
        loadAdminSubmissions();
    }
    if (document.getElementById('adminDashboard')?.classList.contains('active')) {
        loadAllUsersData();
        updateAdminStats();
        updateActivityLog();
    }
    
    const resultDiv = document.getElementById("quizResult");
    let resultHTML = `
        <div class="card">
            <h3>Your Score: ${score}/${totalQuestions} (${percentage}%)</h3>
            <p>${getScoreMessage(percentage)}</p>
            <h4>Detailed Results:</h4>
            <div style="max-height: 400px; overflow-y: auto;">
    `;
    
    results.forEach((result, index) => {
        const statusIcon = result.isCorrect ? '✓' : '✗';
        const statusColor = result.isCorrect ? '#2e7d32' : '#dc3545';
        resultHTML += `
            <div style="padding: 10px; margin: 10px 0; background: #f9f9f9; border-left: 4px solid ${statusColor}; border-radius: 4px;">
                <p><strong>${index + 1}. ${result.question}</strong></p>
                <p>Your answer: ${result.userAnswer}</p>
                <p>Correct answer: ${result.correctAnswer}</p>
                <p style="color: ${statusColor}; font-weight: bold;">${statusIcon} ${result.isCorrect ? 'Correct' : 'Incorrect'}</p>
            </div>
        `;
    });
    
    resultHTML += '</div></div>';
    resultDiv.innerHTML = resultHTML;
    
    updateProfileScore();
    updateProfileStats();
}

function getScoreMessage(percentage) {
    if (percentage >= 90) return "Outstanding! You're a camping master! 🏕🏆";
    if (percentage >= 80) return "Excellent! You know your camping well! 🌲";
    if (percentage >= 70) return "Great job! Solid camping knowledge! 🔥";
    if (percentage >= 60) return "Good effort! Keep learning! ⛺";
    if (percentage >= 50) return "Not bad! Brush up on some areas. 📚";
    if (percentage >= 30) return "Keep studying! Camping safety matters. 🏞️";
    return "Time to hit the books! Safety first! 📖";
}


// JOURNALS
function addJournal() {
    const text = document.getElementById("journalText").value;
    const photoInput = document.getElementById("journalPhoto");
    const photo = photoInput.files[0];

    if (!text && !photo) return;

    const now = new Date();
    const dateTime = now.toLocaleString();

    const entry = {
        text: text,
        photo: photo ? URL.createObjectURL(photo) : null,
        dateTime: dateTime
    };

    journalEntries.push(entry);

    const journalEntry = document.createElement("div");
    journalEntry.className = "card";

    let content = `<p><strong>${dateTime}</strong></p>`;
    if (entry.photo) {
        content += `<img src="${entry.photo}" alt="Journal Photo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">`;
    }
    if (entry.text) {
        content += `<p>${entry.text}</p>`;
    }

    journalEntry.innerHTML = content;
    document.getElementById("journalList").appendChild(journalEntry);

    updateProfileJournals();
    updateProfileStats();
    saveAppData();
    
    // Trigger admin submissions refresh
    if (document.getElementById('adminSubmissions')?.classList.contains('active')) {
        loadAllUsersData();
        loadAdminSubmissions();
    }

    document.getElementById("journalText").value = "";
    photoInput.value = "";
}

function updateProfileJournals() {
    const profileJournals = document.getElementById("profileJournals");
    if (!profileJournals) return;
    profileJournals.innerHTML = "";

    const recentEntries = journalEntries.slice(-3);

    recentEntries.forEach(entry => {
        const profileEntry = document.createElement("div");
        profileEntry.style.marginBottom = "10px";
        profileEntry.style.padding = "10px";
        profileEntry.style.background = "#f9f9f9";
        profileEntry.style.borderRadius = "8px";

        let content = `<p><small>${entry.dateTime}</small></p>`;
        if (entry.photo) {
            content += `<img src="${entry.photo}" alt="Journal Photo" style="max-width: 100%; height: auto; border-radius: 4px;">`;
        }
        if (entry.text) {
            content += `<p>${entry.text.length > 100 ? entry.text.substring(0, 100) + "..." : entry.text}</p>`;
        }

        profileEntry.innerHTML = content;
        profileJournals.appendChild(profileEntry);
    });
}

function updateProfileStats() {
    const journalCountEl = document.getElementById("journalCount");
    const achievementCountEl = document.getElementById("achievementCount");
    if (journalCountEl) journalCountEl.textContent = journalEntries.length;
    if (achievementCountEl) achievementCountEl.textContent = achievements.length;
}

// ACHIEVEMENTS
function addAchievement() {
    const text = document.getElementById("achievementText").value;
    const photoInput = document.getElementById("achievementPhoto");
    const photo = photoInput.files[0];

    if (!text && !photo) return;

    const now = new Date();
    const dateTime = now.toLocaleString();

    const entry = {
        text: text,
        photo: photo ? URL.createObjectURL(photo) : null,
        dateTime: dateTime,
        id: Date.now()
    };

    achievements.push(entry);

    const achievementEntry = document.createElement("div");
    achievementEntry.className = "card";
    achievementEntry.dataset.id = entry.id;

    let content = `<p><strong>${dateTime}</strong></p>`;
    if (entry.photo) {
        content += `<img src="${entry.photo}" alt="Achievement Photo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">`;
    }
    if (entry.text) {
        content += `<p>${entry.text}</p>`;
    }
    content += `<button onclick="editAchievement(${entry.id})">Edit</button> <button onclick="deleteAchievement(${entry.id})">Delete</button>`;

    achievementEntry.innerHTML = content;
    document.getElementById("achievementList").appendChild(achievementEntry);

    updateProfileAchievements();
    updateProfileStats();
    saveAppData();
    
    // Trigger admin submissions refresh
    if (document.getElementById('adminSubmissions')?.classList.contains('active')) {
        loadAllUsersData();
        loadAdminSubmissions();
    }

    document.getElementById("achievementText").value = "";
    photoInput.value = "";
}

function editAchievement(id) {
    const entry = achievements.find(a => a.id === id);
    if (!entry) return;

    const newText = prompt("Edit your achievement reflection:", entry.text);
    if (newText !== null) {
        entry.text = newText;
        refreshAchievements();
        updateProfileAchievements();
        saveAppData();
    }
}

function deleteAchievement(id) {
    achievements = achievements.filter(a => a.id !== id);
    refreshAchievements();
    updateProfileAchievements();
    updateProfileStats();
    saveAppData();
}

function refreshAchievements() {
    const list = document.getElementById("achievementList");
    list.innerHTML = "";
    achievements.forEach(entry => {
        const achievementEntry = document.createElement("div");
        achievementEntry.className = "card";
        achievementEntry.dataset.id = entry.id;

        let content = `<p><strong>${entry.dateTime}</strong></p>`;
        if (entry.photo) {
            content += `<img src="${entry.photo}" alt="Achievement Photo" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;">`;
        }
        if (entry.text) {
            content += `<p>${entry.text}</p>`;
        }
        content += `<button onclick="editAchievement(${entry.id})">Edit</button> <button onclick="deleteAchievement(${entry.id})">Delete</button>`;

        achievementEntry.innerHTML = content;
        list.appendChild(achievementEntry);
    });
}

function updateProfileAchievements() {
    const profileAchievements = document.getElementById("profileAchievements");
    if (!profileAchievements) return;
    profileAchievements.innerHTML = "";

    const recentEntries = achievements.slice(-3);

    recentEntries.forEach(entry => {
        const profileEntry = document.createElement("div");
        profileEntry.style.marginBottom = "10px";
        profileEntry.style.padding = "10px";
        profileEntry.style.background = "#f9f9f9";
        profileEntry.style.borderRadius = "8px";

        let content = `<p><small>${entry.dateTime}</small></p>`;
        if (entry.photo) {
            content += `<img src="${entry.photo}" alt="Achievement Photo" style="max-width: 100%; height: auto; border-radius: 4px;">`;
        }
        if (entry.text) {
            content += `<p>${entry.text.length > 100 ? entry.text.substring(0, 100) + "..." : entry.text}</p>`;
        }

        profileEntry.innerHTML = content;
        profileAchievements.appendChild(profileEntry);
    });
}

// USER INFO FUNCTIONS
function loadUserInfo() {
    updateProfileDisplay();
}

function saveUserInfo() {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const bio = document.getElementById("userBio").value;
    const avatarInput = document.getElementById("userAvatar");
    const avatar = avatarInput.files[0];

    if (name) userInfo.name = name;
    if (email) userInfo.email = email;
    if (bio) userInfo.bio = bio;
    if (avatar) userInfo.avatar = URL.createObjectURL(avatar);

    saveAppData();
    updateProfileDisplay();

    alert('Profile updated successfully!');
}
    avatarInput.value = "";
    alert('Profile saved!');


function updateProfileDisplay() {
    const profileCard = document.querySelector("#profile .card.profile");
    if (!profileCard) return;
    
    const totalQuestions = qaQuestions.length || 0;
    let scoreText = 'Not taken yet';
    if (quizScore > 0) {
        const percent = Math.round((quizScore / totalQuestions) * 100);
        scoreText = `${quizScore}/${totalQuestions} (${percent}%)`;
    }
    
    profileCard.innerHTML = `
        <div class="avatar" style="background-image: url('${userInfo.avatar}'); background-size: cover; background-position: center;"></div>
        <div>
            <h3>${userInfo.name}</h3>
            <p>🏆 ${userInfo.level}</p>
            <p>📧 ${userInfo.email || 'No email set'}</p>
            <p>📝 ${userInfo.bio || 'No bio set'}</p>
            <p>❓ <span id="profileScore">Quiz Score: ${scoreText}</span></p>
            <p>📝 Journals: <span id="journalCount">0</span> | 🏅 Achievements: <span id="achievementCount">0</span></p>
        </div>
    `;
}

function updateProfileScore() {
    const scoreElement = document.getElementById("profileScore");
    if (scoreElement) {
        const totalQuestions = qaQuestions.length || 0;
        if (quizScore > 0 && totalQuestions > 0) {
            const percent = Math.round((quizScore / totalQuestions) * 100);
            scoreElement.textContent = `Quiz Score: ${quizScore}/${totalQuestions} (${percent}%)`;
        } else {
            scoreElement.textContent = 'Quiz Score: Not taken yet';
        }
    }
}

window.onload = function() {
    loadAllUsersData();
    // Check if already logged in
    if (!currentUser) {
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
    }
};

// ============================================
// FOLLOW USERS FUNCTIONS
// ============================================

function loadFollowedUsersSelect() {
    const select = document.getElementById('followUserSelect');
    if (!select) return;
    
    select.innerHTML = '';
    Object.keys(allUsers).forEach(username => {
        if (username !== currentUser) {
            const option = document.createElement('option');
            option.value = username;
            option.textContent = username;
            if (followedUsers.includes(username)) {
                option.selected = true;
            }
            select.appendChild(option);
        }
    });
}

function saveFollowedUsers() {
    const select = document.getElementById('followUserSelect');
    if (!select) return;
    
    followedUsers = Array.from(select.selectedOptions).map(option => option.value);
    saveAppData();
    updateFollowedUsersInfo();
    alert('Followed users saved!');
}

function updateFollowedUsersInfo() {
    const container = document.getElementById('followedUsersInfo');
    if (!container) return;
    
    container.innerHTML = '';
    if (followedUsers.length === 0) {
        container.innerHTML = '<p>You are not following anyone yet.</p>';
        return;
    }
    
    followedUsers.forEach(username => {
        const userData = allUsers[username];
        if (!userData) return;
        
        const userDiv = document.createElement('div');
        userDiv.style.marginBottom = '20px';
        userDiv.style.padding = '15px';
        userDiv.style.background = '#f9f9f9';
        userDiv.style.borderRadius = '8px';
        
        let content = `<h4>${username}'s Information</h4>`;
        
        // Journals
        if (userData.journalEntries && userData.journalEntries.length > 0) {
            content += '<h5>Recent Journals:</h5>';
            userData.journalEntries.slice(-3).forEach(entry => {
                content += `<p><strong>${entry.date}:</strong> ${entry.text}</p>`;
            });
        } else {
            content += '<p>No journals yet.</p>';
        }
        
        // Achievements
        if (userData.achievements && userData.achievements.length > 0) {
            content += '<h5>Achievements:</h5>';
            userData.achievements.slice(-3).forEach(ach => {
                content += `<p>🏆 ${ach.title} - ${ach.date}</p>`;
            });
        } else {
            content += '<p>No achievements yet.</p>';
        }
        
        // Quiz Score
        const totalQuestions = qaQuestions.length || 0;
        let scoreText = 'Not taken yet';
        if (userData.quizScore > 0) {
            const percent = Math.round((userData.quizScore / totalQuestions) * 100);
            scoreText = `${userData.quizScore}/${totalQuestions} (${percent}%)`;
        }
        content += `<p>Quiz Score: ${scoreText}</p>`;
        
        userDiv.innerHTML = content;
        container.appendChild(userDiv);
    });
}

// ============================================
// ADD NEW USER FUNCTION
// ============================================

function addNewUser() {
    const username = document.getElementById('newUserUsername').value.trim();
    const password = document.getElementById('newUserPassword').value.trim();
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }
    
    if (DEMO_USERS[username]) {
        alert('Username already exists');
        return;
    }
    
    // Add to demo users
    DEMO_USERS[username] = password;
    
    // Create user profile
    allUsers[username] = {
        username: username,
        role: 'user',
        journalEntries: [],
        achievements: [],
        quizScore: 0,
        followedUsers: [],
        joinDate: new Date().toLocaleString(),
        lastActive: new Date().toLocaleString(),
        lastLogin: new Date().toLocaleString()
    };
    
    saveAllUsersData();
    
    // Clear inputs
    document.getElementById('newUserUsername').value = '';
    document.getElementById('newUserPassword').value = '';
    
    // Update follow select
    loadFollowedUsersSelect();
    
    alert('New user added successfully! They can now login with: ' + username + '/' + password);
}

function loadUserInfoIntoForm() {
    document.getElementById('userName').value = userInfo.name || '';
    document.getElementById('userEmail').value = userInfo.email || '';
    document.getElementById('userBio').value = userInfo.bio || '';
    // Avatar is file input, can't set value
}
