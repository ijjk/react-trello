import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {CardHeader, CardRightContent, CardTitle, Detail, Footer, MovableCardWrapper} from '../styles/Base'
import {AddButton, CancelButton} from '../styles/Elements'
import Tag from './Tag'
import EditableLabel from './widgets/EditableLabel'
import DeleteButton from './widgets/DeleteButton'

class Card extends Component {
  state = {}

  removeCard = e => {
    const {id, laneId, removeCard, onDelete} = this.props
    removeCard(laneId, id)
    onDelete(id, laneId)
    e.stopPropagation()
  }

  parseMinInt = minStr => {
    const minIdx = minStr.indexOf('min')
    minStr = minIdx > -1 ? minStr.substr(0, minIdx) : minStr
    return parseInt(minStr, 10)
  }

  editField = e => {
    const el = e.target
    const field = el.getAttribute('data-field')
    if (!field || !this.props.editable) return
    this.setState({editing: field})
  }

  cancelEdit = () => {
    this.setState({editing: null})
  }

  updateField = (field, val) => {
    this.setState({[field]: val})
  }

  submitEdit = () => {
    const {editing} = this.state
    const {id, laneId, title, description, allotted, spent, tags} = this.props
    const newCard = {id, laneId, title, description, allotted, spent, tags}
    newCard[editing] = this.state[editing]
    if (editing === 'allotted') newCard.spent = this.state.spent
    this.cancelEdit()
    this.props.onUpdate(newCard)
  }

  isEditing = field => this.props.editable && this.state.editing === field

  renderBody = () => {
    if (this.props.customCardLayout) {
      const {customCard, ...otherProps} = this.props
      return React.cloneElement(customCard, {...otherProps})
    } else {
      const {title, description, allotted, spent, tags} = this.props
      const {editing} = this.state
      let timeLeft
      if (spent && allotted) {
        const spentMins = this.parseMinInt(spent)
        const allottedMins = this.parseMinInt(allotted)
        timeLeft = allottedMins - spentMins
      }
      const RightContent = !timeLeft ? allotted : 'Left: ' + timeLeft + ' min'
      return (
        <span onClick={this.editField}>
          <CardHeader>
            <CardTitle data-field="title">
              {!this.isEditing('title') ? (
                title
              ) : (
                <EditableLabel
                  placeholder={title || 'Title'}
                  onChange={val => this.updateField('title', val)}
                  value={title}
                  autoFocus
                />
              )}
            </CardTitle>
            <CardRightContent data-field="allotted">
              {!this.isEditing('allotted') ? (
                RightContent
              ) : (
                <span>
                  <EditableLabel
                    placeholder={allotted || 'Time allotted'}
                    onChange={val => this.updateField('allotted', val)}
                    autoFocus
                  />
                  <EditableLabel placeholder={spent || 'Time spent'} onChange={val => this.updateField('spent', val)} />
                </span>
              )}
            </CardRightContent>
          </CardHeader>
          <Detail data-field="description">
            {!this.isEditing('description') ? (
              description
            ) : (
              <EditableLabel
                placeholder={description || 'Description'}
                onChange={val => this.updateField('description', val)}
                autoFocus
              />
            )}
          </Detail>
          <Footer>
            {tags && tags.map(tag => <Tag key={tag.title} {...tag} tagStyle={this.props.tagStyle} />)}
            {editing && (
              <span>
                <AddButton onClick={this.submitEdit}>Update</AddButton>
                <CancelButton onClick={this.cancelEdit}>Cancel</CancelButton>
              </span>
            )}
          </Footer>
        </span>
      )
    }
  }

  render() {
    const {id, cardStyle, editable, hideCardDeleteIcon, customCardLayout, dragStyle, ...otherProps} = this.props
    const style = customCardLayout ? {...cardStyle, padding: 0} : cardStyle
    return (
      <MovableCardWrapper
        key={id}
        data-id={id}
        style={{
          ...style,
          ...dragStyle
        }}
        {...otherProps}>
        {this.renderBody()}
        {editable && !hideCardDeleteIcon && <DeleteButton onClick={this.removeCard} />}
      </MovableCardWrapper>
    )
  }
}

Card.defaultProps = {
  cardStyle: {},
  customCardLayout: false,
  onDelete: () => {},
  onUpdate: () => {},
  editable: false,
  dragStyle: {}
}

Card.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  index: PropTypes.number,
  description: PropTypes.string,
  allotted: PropTypes.string,
  spent: PropTypes.string,
  tags: PropTypes.array,
  laneId: PropTypes.string.isRequired,
  removeCard: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  metadata: PropTypes.object,
  cardStyle: PropTypes.object,
  dragStyle: PropTypes.object,
  tagStyle: PropTypes.object,
  customCardLayout: PropTypes.bool,
  customCard: PropTypes.node,
  editable: PropTypes.bool
}

export default Card
