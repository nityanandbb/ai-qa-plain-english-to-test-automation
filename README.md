# ai-qa-plain-english-to-test-automation

 1. clone repo
    2. npm install
    3. build it
    4. add open ai key in .env file 
    5. ask questions.
    node tools/build.js /Users/qed42/NB2025/allDataRepo/alldata-qa
    node tools/ask.js "alldata-qa" auto auto "$(tr '\n' ' ' < tools/testPrompt8.txt)"
    
