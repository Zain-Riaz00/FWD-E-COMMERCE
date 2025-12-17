import mongoose, { Schema, Document } from 'mongoose'

export interface IAdminSettings extends Document {
  helpPageContent: {
    title: string
    description: string
    sections: Array<{
      heading: string
      content: string
    }>
  }
  termsPageContent: {
    title: string
    content: string
  }
  aboutPageContent: {
    title: string
    content: string
  }
  contactPageContent: {
    title: string
    description: string
    email: string
    phone: string
  }
  adminUsers: Array<{
    email: string
    name: string
    isActive: boolean
    addedAt: Date
    addedBy: string
  }>
  siteSettings: {
    siteName: string
    maintenanceMode: boolean
    allowRegistration: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const AdminSettingsSchema: Schema = new Schema(
  {
    helpPageContent: {
      title: {
        type: String,
        default: 'Help Center'
      },
      description: {
        type: String,
        default: 'Need assistance? Browse our FAQs or contact our support team for help with orders, products, or your account. We\'re here to make your experience seamless!'
      },
      sections: [
        {
          heading: String,
          content: String
        }
      ]
    },
    termsPageContent: {
      title: {
        type: String,
        default: 'Terms & Conditions'
      },
      content: {
        type: String,
        default: 'By using Ecom, you agree to our terms and conditions. Please review our policies regarding privacy, returns, and user conduct. For questions, contact our support team.'
      }
    },
    aboutPageContent: {
      title: {
        type: String,
        default: 'About Us'
      },
      content: {
        type: String,
        default: 'Ecom is dedicated to providing the best tech gear and immersive shopping experiences. Our team curates the latest and greatest in electronics, ensuring quality and satisfaction for every customer. Thank you for being part of our journey!'
      }
    },
    contactPageContent: {
      title: {
        type: String,
        default: 'Contact Us'
      },
      description: {
        type: String,
        default: 'We\'d love to hear from you! Please reach out for any questions, feedback, or support.'
      },
      email: {
        type: String,
        default: 'support@ecom.com'
      },
      phone: {
        type: String,
        default: '+1 234 567 890'
      }
    },
    adminUsers: [
      {
        email: {
          type: String,
          required: true,
          lowercase: true
        },
        name: {
          type: String,
          required: true
        },
        isActive: {
          type: Boolean,
          default: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        },
        addedBy: {
          type: String,
          required: true
        }
      }
    ],
    siteSettings: {
      siteName: {
        type: String,
        default: 'Buy or Die'
      },
      maintenanceMode: {
        type: Boolean,
        default: false
      },
      allowRegistration: {
        type: Boolean,
        default: true
      }
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema)
