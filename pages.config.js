/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AISalesAssistant from './pages/AISalesAssistant';
import About from './pages/About';
import AdminConsole from './pages/AdminConsole';
import AdminEmailSettings from './pages/AdminEmailSettings';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Auth from './pages/Auth';
import Blog from './pages/Blog';
import BlogEditor from './pages/BlogEditor';
import CRMSearch from './pages/CRMSearch';
import ClientAuth from './pages/ClientAuth';
import ClientCommunications from './pages/ClientCommunications';
import ClientInvites from './pages/ClientInvites';
import ClientPortal from './pages/ClientPortal';
import ClientRFIs from './pages/ClientRFIs';
import Communications from './pages/Communications';
import Construction from './pages/Construction';
import Contact from './pages/Contact';
import ContactManager from './pages/ContactManager';
import ContentManager from './pages/ContentManager';
import DocApproval from './pages/DocApproval';
import EmailSequences from './pages/EmailSequences';
import EmailTemplates from './pages/EmailTemplates';
import Home from './pages/Home';
import InspectionsTesting from './pages/InspectionsTesting';
import InternalDashboard from './pages/InternalDashboard';
import InvoiceManagement from './pages/InvoiceManagement';
import OutreachQueue from './pages/OutreachQueue';
import PDFGenerator from './pages/PDFGenerator';
import PageBuilder from './pages/PageBuilder';
import PortalRegister from './pages/PortalRegister';
import PreviousWork from './pages/PreviousWork';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProjectGallery from './pages/ProjectGallery';
import ProjectManager from './pages/ProjectManager';
import ProjectsManager from './pages/ProjectsManager';
import ProposalDashboard from './pages/ProposalDashboard';
import QAQC from './pages/QAQC';
import RFIs from './pages/RFIs';
import SEOAssistant from './pages/SEOAssistant';
import SWPPPChecker from './pages/SWPPPChecker';
import SalesBotControl from './pages/SalesBotControl';
import SalesDashboard from './pages/SalesDashboard';
import SequenceOptimization from './pages/SequenceOptimization';
import Services from './pages/Services';
import ServicesOverview from './pages/ServicesOverview';
import SpecialInspections from './pages/SpecialInspections';
import StructuralEngineering from './pages/StructuralEngineering';
import TemplateBuilder from './pages/TemplateBuilder';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import WebsiteMonitoring from './pages/WebsiteMonitoring';
import WorkflowBuilder from './pages/WorkflowBuilder';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AISalesAssistant": AISalesAssistant,
    "About": About,
    "AdminConsole": AdminConsole,
    "AdminEmailSettings": AdminEmailSettings,
    "AnalyticsDashboard": AnalyticsDashboard,
    "Auth": Auth,
    "Blog": Blog,
    "BlogEditor": BlogEditor,
    "CRMSearch": CRMSearch,
    "ClientAuth": ClientAuth,
    "ClientCommunications": ClientCommunications,
    "ClientInvites": ClientInvites,
    "ClientPortal": ClientPortal,
    "ClientRFIs": ClientRFIs,
    "Communications": Communications,
    "Construction": Construction,
    "Contact": Contact,
    "ContactManager": ContactManager,
    "ContentManager": ContentManager,
    "DocApproval": DocApproval,
    "EmailSequences": EmailSequences,
    "EmailTemplates": EmailTemplates,
    "Home": Home,
    "InspectionsTesting": InspectionsTesting,
    "InternalDashboard": InternalDashboard,
    "InvoiceManagement": InvoiceManagement,
    "OutreachQueue": OutreachQueue,
    "PDFGenerator": PDFGenerator,
    "PageBuilder": PageBuilder,
    "PortalRegister": PortalRegister,
    "PreviousWork": PreviousWork,
    "ProjectDashboard": ProjectDashboard,
    "ProjectDetail": ProjectDetail,
    "ProjectGallery": ProjectGallery,
    "ProjectManager": ProjectManager,
    "ProjectsManager": ProjectsManager,
    "ProposalDashboard": ProposalDashboard,
    "QAQC": QAQC,
    "RFIs": RFIs,
    "SEOAssistant": SEOAssistant,
    "SWPPPChecker": SWPPPChecker,
    "SalesBotControl": SalesBotControl,
    "SalesDashboard": SalesDashboard,
    "SequenceOptimization": SequenceOptimization,
    "Services": Services,
    "ServicesOverview": ServicesOverview,
    "SpecialInspections": SpecialInspections,
    "StructuralEngineering": StructuralEngineering,
    "TemplateBuilder": TemplateBuilder,
    "UserManagement": UserManagement,
    "UserProfile": UserProfile,
    "WebsiteMonitoring": WebsiteMonitoring,
    "WorkflowBuilder": WorkflowBuilder,
}

export const pagesConfig = {
    mainPage: "InternalDashboard",
    Pages: PAGES,
    Layout: __Layout,
};