import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Welcome to <span className="text-primary">Jobsy</span>
                </h1>
                <p className="hero-subtitle">
                  Your Gateway to Career Success
                </p>
                <p className="hero-description">
                  Connect students with top employers, streamline placement processes, 
                  and build successful careers. Join thousands of students and companies 
                  who trust Jobsy for their placement needs.
                </p>
                <div className="hero-buttons">
                  <Link to="/register" className="btn btn-primary btn-lg me-3">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg">
                    Sign In
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="hero-card-stack">
                  <Card className="floating-card card-1">
                    <Card.Body>
                      <h5>🎓 For Students</h5>
                      <p>Find your dream job with personalized recommendations</p>
                    </Card.Body>
                  </Card>
                  <Card className="floating-card card-2">
                    <Card.Body>
                      <h5>🏢 For Employers</h5>
                      <p>Discover talented candidates from top institutions</p>
                    </Card.Body>
                  </Card>
                  <Card className="floating-card card-3">
                    <Card.Body>
                      <h5>📊 For Admins</h5>
                      <p>Manage placements with powerful analytics tools</p>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Why Choose Jobsy?</h2>
              <p className="section-subtitle">
                Everything you need for successful campus placements
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">🚀</div>
                  <h5>Smart Matching</h5>
                  <p>AI-powered job recommendations based on skills and preferences</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">📱</div>
                  <h5>Real-time Updates</h5>
                  <p>Get instant notifications about applications and interview schedules</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">📈</div>
                  <h5>Analytics Dashboard</h5>
                  <p>Track placement statistics and performance metrics</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-subtitle">
                Join our platform and take the next step in your career journey
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-light btn-lg me-3">
                  Create Account
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Sign In
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5>Jobsy</h5>
              <p>Connecting talent with opportunity</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p>&copy; 2024 Jobsy. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
