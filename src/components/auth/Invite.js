import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { Link } from 'react-router';
import classnames from 'classnames';

import Infobox from '../ui/Infobox';
import Appear from '../ui/effects/Appear';
import Form from '../../lib/Form';
import { email } from '../../helpers/validation-helpers';
import Input from '../ui/Input';
import Button from '../ui/Button';

const messages = defineMessages({
  headline: {
    id: 'invite.headline.friends',
    defaultMessage: '!!!Invite 3 of your friends or colleagues',
  },
  nameLabel: {
    id: 'invite.name.label',
    defaultMessage: '!!!Name',
  },
  emailLabel: {
    id: 'invite.email.label',
    defaultMessage: '!!!Email address',
  },
  submitButtonLabel: {
    id: 'invite.submit.label',
    defaultMessage: '!!!Send invites',
  },
  skipButtonLabel: {
    id: 'invite.skip.label',
    defaultMessage: '!!!I want to do this later',
  },
});

@observer
export default class Invite extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    from: PropTypes.string,
    embed: PropTypes.bool,
  };

  static defaultProps = {
    from: '/',
    embed: false,
  };

  static contextTypes = {
    intl: intlShape,
  };

  state = { showSuccessMessage: false };

  handlers = {
    onChange: (field) => {
      this.setState({ showSuccessMessage: false })
    }
  };

  form = new Form({
    fields: {
      invite: [...Array(3).fill({
        fields: {
          name: {
            label: this.context.intl.formatMessage(messages.nameLabel),
            placeholder: this.context.intl.formatMessage(messages.nameLabel),
            handlers: this.handlers,
            // related: ['invite.0.email'], // path accepted but does not work
          },
          email: {
            label: this.context.intl.formatMessage(messages.emailLabel),
            placeholder: this.context.intl.formatMessage(messages.emailLabel),
            handlers: this.handlers,
            validators: [email],
          },
        },
      })],
    },
  }, this.context.intl);

  submit(e) {
    e.preventDefault();
    
    const from = this.props.from;
    
    this.form.submit({
      onSuccess: (form) => {
        this.props.onSubmit({
          invites: form.values().invite,
          from
        });

        this.form.clear()
        // this.form.$('invite.0.name').focus() // path accepted but does not focus ;(
        document.querySelector('input:first-child').focus()
        this.setState({ showSuccessMessage: true })
      },
      onError: () => {},
    });
  }

  render() {
    const { form } = this;
    const { intl } = this.context;
    const { from, embed, success, isInviteSuccessful } = this.props;

    const atLeastOneEmailAddress = form.$('invite')
      .map(invite => invite.$('email').value)
      .some(emailValue => emailValue.trim() !== '');

    const sendButtonClassName = classnames({
      auth__button: true,
      'invite__embed--button': embed,
    });

    return (
      <div>
        {this.state.showSuccessMessage && isInviteSuccessful && (<Appear>
          <Infobox
            type="success"
            icon="checkbox-marked-circle-outline"
            dismissable
          >
            Great Success!
          </Infobox>
        </Appear>)}

      <form className="franz-form auth__form" onSubmit={e => this.submit(e)}>
        {!embed && (<img
          src="./assets/images/logo.svg"
          className="auth__logo"
          alt=""
        />)}
        <h1 className={embed && 'invite__embed'}>
          {intl.formatMessage(messages.headline)}
        </h1>
        {form.$('invite').map(invite => (
          <div className="grid" key={invite.key}>
            <div className="grid__row">
              <Input field={invite.$('name')} showLabel={false} />
              <Input field={invite.$('email')} showLabel={false} />
            </div>
          </div>
        ))}
        <Button
          type="submit"
          className={sendButtonClassName}
          disabled={!atLeastOneEmailAddress}
          label={intl.formatMessage(messages.submitButtonLabel)}
        />
        {!embed && (<Link
          to={from || '/'}
          className="franz-form__button franz-form__button--secondary auth__button auth__button--skip"
        >
          {intl.formatMessage(messages.skipButtonLabel)}
        </Link>)}
      </form>
      </div>
    );
  }
}
