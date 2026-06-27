-- Draft PostgreSQL schema for Thayyib MVP

CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  contact_email TEXT,
  risk_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  supplier_id UUID REFERENCES suppliers(id),
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  document_id UUID REFERENCES documents(id),
  certificate_number TEXT,
  issued_by TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'valid'
);

CREATE TABLE ai_analysis_results (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  risk_level TEXT NOT NULL,
  confidence NUMERIC,
  summary TEXT,
  findings JSONB,
  sources JSONB,
  model_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
