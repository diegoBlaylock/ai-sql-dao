-- Setup

DROP SCHEMA IF EXISTS ai CASCADE;
CREATE SCHEMA ai;

-- Entities

CREATE TABLE ai.Address (
  id SERIAL,
  street VARCHAR(64) NOT NULL,
  city VARCHAR(64) NOT NULL,
  state CHAR(2) NOT NULL,
  zip CHAR(5) NOT NULL CHECK (zip ~ '^[0-9]+$' ),
  PRIMARY KEY (id)
);

CREATE TABLE ai.Paper (
  id SERIAL,
  title VARCHAR(128) NOT NULL,
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TYPE ai.LOCATION AS ENUM ('online', 'physical');

CREATE TABLE ai.University (
  id SERIAL,
  name VARCHAR(64) NOT NULL,
  shortName VARCHAR(10),
  addressId INT UNIQUE, -- Not null for the case of online university
  type ai.LOCATION  NOT NULL,
  PRIMARY KEY(id),
  FOREIGN KEY (addressId) REFERENCES ai.Address (id)
);
CREATE INDEX index_on_university_name ON ai.University (name);

CREATE TABLE ai.Person (
  id SERIAL,
  firstName VARCHAR(64) NOT NULL,
  lastName VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  addressId INT NOT NULL,
  universityId INT,
  PRIMARY KEY (id),
  FOREIGN KEY (addressId) REFERENCES ai.Address (id),
  FOREIGN KEY (universityId) REFERENCES ai.University (id),
  UNIQUE (email)
);

CREATE INDEX index_on_last_name ON ai.Person (lastName);

CREATE TABLE ai.Keyword (
  id SERIAL,
  name VARCHAR(32) NOT NULL,
  description VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE (name)
);

CREATE TABLE ai.Domain (
  id SERIAL,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE (name)
);

-- Relationships
CREATE TABLE ai.PaperAuthor(
  paperId INT NOT NULL,
  authorId INT NOT NULL,
  PRIMARY KEY (paperId, authorId),
  FOREIGN KEY (paperId) REFERENCES ai.Paper (id),
  FOREIGN KEY (authorId) REFERENCES ai.Person(id)
);

CREATE TABLE ai.PaperReviewer(
  paperId INT NOT NULL,
  reviewerId INT NOT NULL,
  PRIMARY KEY (paperId, reviewerId),
  FOREIGN KEY (paperId) REFERENCES ai.Paper (id),
  FOREIGN KEY (reviewerId) REFERENCES ai.Person(id)
);

CREATE TABLE ai.PaperKeyword(
  paperId INT NOT NULL,
  keywordId INT NOT NULL,
  PRIMARY KEY (paperId, keywordId),
  FOREIGN KEY (paperId) REFERENCES ai.Paper (id),
  FOREIGN KEY (keywordId) REFERENCES ai.Keyword(id)
);

CREATE TABLE ai.PersonDomain(
  personId INT NOT NULL,
  domainId INT NOT NULL,
  PRIMARY KEY (personId, domainId),
  FOREIGN KEY (personId) REFERENCES ai.Person (id),
  FOREIGN KEY (domainId) REFERENCES ai.Domain(id)
);

/*
ENTITIES
  - Paper
  - Person {Author, Reviewers}
  - Keywords
  - Addresses
  - university
  - Expertise
*/

/*
Relationships
  - Author > -- < Paper
  - Paper > -- < Reviewers
  - Paper > -- < Keywords
  - Person > -- - university
  - university - -- - Address
  - Person - -- - Address
*/