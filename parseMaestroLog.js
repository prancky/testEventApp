#!/usr/bin/env node

      const fs = require('node:fs');
      const path = require('node:path');

      // Get the log file path from command line arguments
      const logFilePath = process.argv[2];

      if (!logFilePath) {
        console.error('Usage: node parseMaestroLog.js <log-file-path>');
        process.exit(1);
      }

      if (!fs.existsSync(logFilePath)) {
        console.error(`Log file not found: ${logFilePath}`);
        process.exit(1);
      }

      try {
        // Read the Maestro log file
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        
        // Parse the log content and extract test results
        const lines = logContent.split('\n');
        const testResults = {
          timestamp: new Date().toISOString(),
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          warnings: 0,
          tests: [],
          summary: {
            status: 'unknown',
            duration: null,
            device: null
          }
        };

        let currentFlow = null;

        for (const rawLine of lines) {
          const line = rawLine.trim();
          
          // Extract device information
          if (line.includes('Running on ')) {
            testResults.summary.device = line.replace('Running on ', '');
          }
          
          // Extract flow information
          if (line.includes('> Flow: ')) {
            const flowName = line.split('> Flow: ')[1];
            currentFlow = {
              name: flowName,
              status: 'running',
              steps: [],
              startTime: new Date().toISOString()
            };
            testResults.tests.push(currentFlow);
            testResults.totalTests++;
          }
          
          // Extract step information
          if (line.includes('✅') || line.includes('❌') || line.includes('⚠️')) {
            if (currentFlow) {
              let status;
              if (line.includes('✅')) {
                status = 'passed';
              } else if (line.includes('❌')) {
                status = 'failed';
              } else {
                status = 'warning';
              }
              const stepText = line.replace(/[✅❌⏳🔲]/gu, '').replace('⚠️', '').trim();
              
              currentFlow.steps.push({
                step: stepText,
                status: status,
                timestamp: new Date().toISOString()
              });
              
              if (status === 'failed') {
                currentFlow.status = 'failed';
              } else if (status === 'warning') {
                testResults.warnings++;
              }
            }
          }
          
          // Check for error messages
          if (line.includes('Error:') || line.includes('failed') || line.includes('Command exited with code 1')) {
            if (currentFlow && currentFlow.status !== 'failed') {
              currentFlow.status = 'failed';
            }
          }
        }
        
        // Finalize test results
        testResults.tests.forEach(test => {
          if (test.status === 'failed') {
            testResults.failedTests++;
          } else if (test.status !== 'running') {
            testResults.passedTests++;
            test.status = 'passed';
          }
        });
        
        // Determine overall status
        if (testResults.failedTests > 0) {
          testResults.summary.status = 'failed';
        } else if (testResults.passedTests > 0) {
          testResults.summary.status = 'passed';
        }
        
        // Output JSON result
        const outputFile = path.join(path.dirname(logFilePath), 'maestro-test-results.json');
        fs.writeFileSync(outputFile, JSON.stringify(testResults, null, 2));
        
        console.log('📊 Maestro log parsed successfully!');
        console.log(`📄 Results saved to: ${outputFile}`);
        console.log(`📈 Summary: ${testResults.passedTests} passed, ${testResults.failedTests} failed, ${testResults.warnings} warnings`);
        
        if (testResults.summary.status === 'failed') {
          process.exit(1);
        }
        
      } catch (error) {
        console.error('Error parsing Maestro log:', error.message);
        process.exit(1);
      }