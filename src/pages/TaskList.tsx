import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  List,
  Checkbox,
  Typography,
  Space,
  Modal,
  message,
  Empty,
  Divider,
  Avatar,
  Progress,
  Tooltip,
  Tag
} from 'antd';
import {
  PlusOutlined,
  LogoutOutlined,
  DeleteOutlined,
  UserOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { fetchTasks, createTask, updateChecklistItem, deleteTask } from '../store/slices/tasksSlice';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { Task, ChecklistItem } from '../types';
import './TaskList.css'
const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskList: React.FC = () => {
  const [taskForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchTasks() as any);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    taskForm.resetFields();
    setNewChecklistItems(['']);
  };

  const handleAddChecklistItem = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  const handleRemoveChecklistItem = (index: number) => {
    const updatedItems = newChecklistItems.filter((_, i) => i !== index);
    setNewChecklistItems(updatedItems);
  };

  const handleCreateTask = async (values: { title: string; description?: string }) => {
    const checklist: ChecklistItem[] = newChecklistItems
      .filter(item => item.trim() !== '')
      .map(text => ({ text, completed: false }));
    
    try {
      await dispatch(createTask({
        title: values.title,
        description: values.description,
        checklist
      }) as any).unwrap();
      
      message.success('Task created successfully!');
      handleCancel();
    } catch (error) {
      message.error('Failed to create task');
    }
  };

  const handleCheckboxChange = async (taskId: string, itemIndex: number, completed: boolean) => {
    try {
      await dispatch(updateChecklistItem({ taskId, itemIndex, completed }) as any).unwrap();
    } catch (error) {
      message.error('Failed to update checklist item');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this task?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(deleteTask(taskId) as any).unwrap();
          message.success('Task deleted successfully!');
        } catch (error) {
          message.error('Failed to delete task');
        }
      },
    });
  };

  const calculateProgress = (task: Task) => {
    const completed = task.checklist.filter(item => item.completed).length;
    const total = task.checklist.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getProgressColor = (percent: number) => {
    if (percent === 100) return 'success';
    if (percent >= 50) return 'normal';
    return 'exception';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout className="task-layout">
      <Header className="task-header">
        <div className="header-content">
          <Title level={3} className="header-title" style={{ color: 'white', margin: 0 }}>
            Task Manager
          </Title>
          <Space>
            <Tooltip title={`Logged in as ${user?.username}`}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              New Task
            </Button>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="task-content">
        <div className="content-container">
          {tasks.length === 0 && !loading ? (
            <Empty
              description="No tasks yet. Create your first task to get started!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                Create Your First Task
              </Button>
            </Empty>
          ) : (
            <List
              loading={loading}
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
              dataSource={tasks}
              renderItem={(task: Task) => {
                const progress = calculateProgress(task);
                const completedCount = task.checklist.filter(item => item.completed).length;
                const totalCount = task.checklist.length;
                
                return (
                  <List.Item>
                    <Card
                      className="task-card"
                      actions={[
                        <Tooltip title="Delete task">
                          <DeleteOutlined
                            key="delete"
                            onClick={() => handleDeleteTask(task._id)}
                            style={{ color: '#ff4d4f' }}
                          />
                        </Tooltip>
                      ]}
                    >
                      <div className="task-card-header">
                        <Title level={4} className="task-title" ellipsis={{ tooltip: task.title }}>
                          {task.title}
                        </Title>
                        <div className="progress-section">
                          <Progress
                            type="circle"
                            percent={progress}
                            size={60}
                            strokeColor={progress === 100 ? '#52c41a' : '#1890ff'}
                            format={percent => `${percent}%`}
                          />
                          <div className="progress-stats">
                            <Text type="secondary">
                              {completedCount}/{totalCount} completed
                            </Text>
                          </div>
                        </div>
                      </div>

                      {task.description && (
                        <Text className="task-description" type="secondary">
                          {task.description}
                        </Text>
                      )}

                      <Divider />

                      <div className="checklist-section">
                        <Text strong>Checklist:</Text>
                        <List
                          dataSource={task.checklist}
                          renderItem={(item, index) => (
                            <List.Item className="checklist-item">
                              <Checkbox
                                checked={item.completed}
                                onChange={(e) =>
                                  handleCheckboxChange(task._id, index, e.target.checked)
                                }
                              >
                                <span
                                  className={item.completed ? 'completed-text' : ''}
                                  style={{ marginLeft: 8 }}
                                >
                                  {item.text}
                                </span>
                              </Checkbox>
                            </List.Item>
                          )}
                          locale={{ emptyText: 'No checklist items' }}
                        />
                      </div>

                      <Divider />

                      <div className="task-meta">
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created: {formatDate(task.createdAt)}
                          </Text>
                          {task.updatedAt !== task.createdAt && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Updated: {formatDate(task.updatedAt)}
                            </Text>
                          )}
                          <Tag color={getProgressColor(progress)}>
                            {progress === 100 ? 'Completed' : 'In Progress'}
                          </Tag>
                        </Space>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Content>

      <Modal
        title="Create New Task"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          name="createTask"
          onFinish={handleCreateTask}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Task Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a task title!' }]}
          >
            <Input placeholder="Enter task title" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              placeholder="Enter task description (optional)"
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="Checklist Items">
            <div className="checklist-inputs">
              {newChecklistItems.map((item, index) => (
                <div key={index} className="checklist-input-item">
                  <Input
                    placeholder={`Checklist item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                    style={{ marginBottom: 8 }}
                    suffix={
                      newChecklistItems.length > 1 ? (
                        <CloseOutlined
                          onClick={() => handleRemoveChecklistItem(index)}
                          style={{ color: '#ff4d4f', cursor: 'pointer' }}
                        />
                      ) : null
                    }
                  />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={handleAddChecklistItem}
                block
                icon={<PlusOutlined />}
              >
                Add Checklist Item
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Task
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TaskList;