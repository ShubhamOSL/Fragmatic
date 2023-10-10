#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const Sentiment = require('sentiment');
const compromise = require('compromise');
const mongoose = require('mongoose');
const dbConnection = require('./db'); // Import the database connection


// Define a schema for storing analysis results in MongoDB
const analysisSchema = new mongoose.Schema({
  date: String, // Add date field if it's not already present in your CSV data
  headline: String,
  entities: [String],
  sentimentResult: String,
});

// Define indexes on 'date' and 'entities' fields
analysisSchema.index({ date: 1, entities: 1 });

// Define a model based on the schema
const Analysis = mongoose.model('headings', analysisSchema);

program
  .version('1.0.0')
  .description('A CLI tool for data ingestion and NLP processing.');

// Command to import headlines from a CSV file
program
  .command('import-headlines <csvFilePath>')
  .description('Import headlines dataset from a CSV file.')
  .action(async (csvFilePath) => {
    try {
      // Start measuring execution time
      const startTime = new Date().getTime();

      // Read the CSV file
      const data = fs.readFileSync(csvFilePath, 'utf8');
      // Split the CSV data into lines and process each line
      const lines = data.split('\n');

      // Connect to MongoDB (update the connection string)
      await mongoose.connect('mongodb://localhost/news_headlines_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Define a model for the imported headlines
      const ImportedHeadline = mongoose.model('imported_headlines', analysisSchema);

      // Process and store the imported headlines in MongoDB
      for (const line of lines) {
        const columns = line.split(',');
        if (columns.length === 2) {
          const headlineText = columns[1] ? columns[1].trim() : '';
          if (headlineText) {
            await ImportedHeadline.create({
              date: columns[0], 
              headline: headlineText,
            });
          }
        }
      }

      // Calculate execution time
      const endTime = new Date().getTime();
      const executionTime = (endTime - startTime) / 1000; // in seconds

      console.log(`Data imported and stored in MongoDB successfully in ${executionTime} seconds.`);

      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

  
// Command to extract entities and analyze sentiment
program
  .command('extract-entities')
  .description('Extract entities and analyze sentiment of headlines.')
  .action(async () => {
    try {
      // Connect to MongoDB (update the connection string)
      await mongoose.connect('mongodb://localhost/news_headlines_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Start measuring execution time
      const startTime = new Date().getTime();

      // Read the CSV file 
      const data = fs.readFileSync('small.csv', 'utf8');
      const lines = data.split('\n');

      // Create a Sentiment instance for sentiment analysis
      const sentiment = new Sentiment();

      // Placeholder function for entity extraction and sentiment analysis
      async function extractEntitiesAndAnalyzeSentiment(text) {
        const doc = compromise(text);

        // Extract entities (named entities, organizations, locations, etc.)
        const entities = doc.people().out('array').concat(doc.organizations().out('array'), doc.places().out('array'));

        // Analyze the sentiment of the text
        const result = sentiment.analyze(text);

        // Determine the sentiment type based on the score
        let sentimentType;
        if (result.score > 0) {
          sentimentType = 'positive';
        } else if (result.score < 0) {
          sentimentType = 'negative';
        } else {
          sentimentType = 'neutral';
        }

        return {
          entities,
          sentimentResult: sentimentType,
        };
      }
       var count=0;
      // Process headlines, extract entities, and analyze sentiment
      const results = [];
      for (const line of lines) {
        const columns = line.split(',');
        if (columns.length === 2) {
          const headlineText = columns[1] ? columns[1].trim() : '';
          if (headlineText) {
            const analysisResult = await extractEntitiesAndAnalyzeSentiment(headlineText);

            // Store the analysis result in MongoDB
            await Analysis.create({
              date: columns[0], 
              headline: headlineText,
              entities: analysisResult.entities,
              sentimentResult: analysisResult.sentimentResult,
            });
            count++;
            console.log(count);
            results.push(analysisResult);
          }
        }
      }

      // Calculate execution time
      const endTime = new Date().getTime();
      const executionTime = (endTime - startTime) / 1000; // in seconds

      console.log(`Entities extracted and sentiment analyzed in ${executionTime} seconds.`);

      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
    }
  });


program
  .command('top100entitieswithtype')
  .description('Retrieve and display the top 100 entities with their types')
  .action(async () => {
    try {
      // Connect to MongoDB (update the connection string)
      await mongoose.connect('mongodb://localhost/news_headlines_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Start measuring execution time
      const startTime = new Date().getTime();

      // Define a pipeline to aggregate and count entities by name and type
      const pipeline = [
        {
          $unwind: '$entities',
        },
        {
          $group: {
            _id: { name: '$entities', type: '$sentimentResult' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 100,
        },
      ];

      // Aggregate and retrieve the top 100 entities with their types
      const topEntities = await Analysis.aggregate(pipeline);

      // Print the top 100 entities
      topEntities.forEach((entity, index) => {
        console.log(`${index + 1}. Entity: ${entity._id.name} (${entity._id.type}), Count: ${entity.count}`);
      });

      // Calculate execution time
      const endTime = new Date().getTime();
      const executionTime = (endTime - startTime) / 1000; // in seconds

      console.log(`Top 100 Entities with Types retrieved in ${executionTime} seconds.`);

      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

  program
  .command('top100entitieswithtype')
  .description('Retrieve and display the top 100 entities with their types')
  .action(async () => {
    try {
      // Connect to MongoDB (update the connection string)
      await mongoose.connect('mongodb://localhost/news_headlines_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Start measuring execution time
      const startTime = new Date().getTime();

      // Define a pipeline to aggregate and count entities by name and type
      const pipeline = [
        {
          $unwind: '$entities',
        },
        {
          $group: {
            _id: { name: '$entities', type: '$sentimentResult' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 100,
        },
      ];

      // Aggregate and retrieve the top 100 entities with their types
      const topEntities = await Analysis.aggregate(pipeline);

      // Print the top 100 entities
      topEntities.forEach((entity, index) => {
        console.log(`${index + 1}. Entity: ${entity._id.name} (${entity._id.type}), Count: ${entity.count}`);
      });

      // Calculate execution time
      const endTime = new Date().getTime();
      const executionTime = (endTime - startTime) / 1000; // in seconds

      console.log(`Top 100 Entities with Types retrieved in ${executionTime} seconds.`);

      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
    }
  });  


  program
  .command('allheadlinesfor <entityName>')
  .description('Retrieve and display all headlines for a given entity name.')
  .action(async (entityName) => {
    try {
      // Connect to MongoDB (update the connection string)
      await mongoose.connect('mongodb://localhost/news_headlines_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Start measuring execution time
      const startTime = new Date().getTime();

      // Find all headlines that contain the specified entity name
      const query = {
        entities: entityName,
      };

      const headlines = await Analysis.find(query);

      // Display all headlines for the entity
      console.log(`Headlines for Entity: ${entityName}`);
      headlines.forEach((headline, index) => {
        console.log(`${index + 1}. ${headline.headline}`);
      });

      // Calculate execution time
      const endTime = new Date().getTime();
      const executionTime = (endTime - startTime) / 1000; // in seconds

      console.log(`All headlines for ${entityName} retrieved in ${executionTime} seconds.`);

      // Disconnect from MongoDB
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
    }
  });









program.parse(process.argv);
